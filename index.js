const request = require('request-promise-native');
const Url = require('url');
const vm = require('vm');
const {
  randomFromRange,
  randomTrueFalse,
  delay,
  uuid,
  getRandomUserAgent
} = require('./src/utils');

function getMouseMovements(timestamp) {
  let lastMovement = timestamp;
  const motionCount = randomFromRange(1000, 10000);
  const mouseMovements = [];
  for (let i = 0; i < motionCount; i++) {
    lastMovement += randomFromRange(0, 10);
    mouseMovements.push([randomFromRange(0, 500), randomFromRange(0, 500), lastMovement]);
  }
  return mouseMovements;
}

async function hsl(req) {
  const hsl = await request.get('https://assets.hcaptcha.com/c/500c658/hsl.js');
  return new Promise((resolve, reject) => {
    const code = `
    var self = {};
    function atob(a) {
      return new Buffer(a, 'base64').toString('binary');
    }
  
    ${hsl}
  
    hsl('${req}').then(resolve).catch(reject)
    `;
    vm.runInNewContext(code, {
      Buffer,
      resolve,
      reject,
    });
  });
}


async function tryToSolve(sitekey, host) {
  const userAgent = getRandomUserAgent();
  const headers = {
    'User-Agent': userAgent
  };
  
  let response = await request({
    method: 'get',
    headers,
    json: true,
    url: `https://hcaptcha.com/checksiteconfig?host=${host}&sitekey=${sitekey}&sc=1&swa=0`
  });

  let timestamp = Date.now() + randomFromRange(30, 120);
  response = await request({
    method: 'post',
    headers,
    json: true,
    url: 'https://hcaptcha.com/getcaptcha',
    form: {
      sitekey,
      host,
      n: await hsl(response.c.req),
      c: JSON.stringify(response.c),
      motionData: {
        st: timestamp,
        dct: timestamp,
        mm: getMouseMovements(timestamp)
      }
    }
  });

  if (response.generated_pass_UUID) {
    return response.generated_pass_UUID;
  }

  const key = response.key;
  const tasks = response.tasklist;
  const job = response.request_type;
  timestamp = Date.now() + randomFromRange(30, 120);
  const answers = tasks.reduce((accum, t) => ({ ...accum, [t.task_key]: randomTrueFalse() }), {});
  const captchaResponse = {
    answers,
    sitekey,
    serverdomain: host,
    job_mode: job,
    motionData: {
      st: timestamp,
      dct: timestamp,
      mm: getMouseMovements(timestamp)
    }
  };

  response = await request(`https://hcaptcha.com/checkcaptcha/${key}`, {
    method: 'post',
    headers,
    json: true,
    form: captchaResponse
  });

  if (response.generated_pass_UUID) {
    return response.generated_pass_UUID;
  }
}

async function solveCaptcha(url, options = {}) {
  const { gentleMode, timeoutInMs = 12000000 } = options;
  const { hostname } = Url.parse(url);
  const siteKey = uuid();
  const startingTime = Date.now();

  while (true) {
    try {
      const result = await tryToSolve(siteKey, hostname);
      if (result) {
        return result;
      }
    } catch (e) {
      if (e.statusCode === 429) {
        // reached rate limit, wait 30 sec
        await delay(30000);
      } else {
        throw e;
      }
    }
    if (Date.now() - startingTime > timeoutInMs) {
      throw new Error('captcha resolution timeout');
    }
    if (gentleMode) {
      // wait a bit to avoid rate limit errors
      delay(3000);
    }
  }
}

module.exports = solveCaptcha;
