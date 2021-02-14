const fetch = require("node-fetch");
const { URL } = require("url");
const vm = require("vm");
const {
    randomFromRange,
    randomTrueFalse,
    delay,
    uuid,
    getRandomUserAgent,
    encodeFormData
} = require("./src/utils");

function getMouseMovements(timestamp) {
    let lastMovement = timestamp;
    const motionCount = randomFromRange(1000, 10000); // 100, 1000
    const mouseMovements = [];
    for (let i = 0; i < motionCount; i++) {
        lastMovement += randomFromRange(0, 10);
        mouseMovements.push([randomFromRange(0, 500), randomFromRange(0, 500), lastMovement]);
    }
    return mouseMovements;
}

let hslFile;

async function hsl(req) {
    const hsl = hslFile = hslFile || (await fetch("https://assets.hcaptcha.com/c/3118c3eb/hsl.js").then(res => res.text())); // https://assets.hcaptcha.com/c/b147199/hsl.js
    return new Promise((resolve, reject) => {
        const code = `
    var self = {};
    globalThis.window = globalThis
    globalThis.atob = function(a) {
        return Buffer.from(a, "base64").toString("binary");
    }
    globalThis.btoa = function(a) {
        return Buffer.from(a).toString("base64");
    }
    globalThis.navigator = {
      userAgent: "${getRandomUserAgent()}"
    }
  
    ${hsl}
  
    hsl("${req}").then(resolve).catch(reject)
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
        "user-agent": userAgent,
        "origin": "https://assets.hcaptcha.com",
    };

    let response = await (await fetch(`https://hcaptcha.com/checksiteconfig?host=${host}&sitekey=${sitekey}&sc=1&swa=0`, {
        method: "GET",
        headers,
    })).json()
    let timestamp = Date.now() + randomFromRange(30, 120);
    response = await (await fetch("https://hcaptcha.com/getcaptcha", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            ...headers
        },
        body: encodeFormData({
            sitekey,
            host,
            n: await hsl(response.c.req),
            c: JSON.stringify(response.c),
            motionData: JSON.stringify({
                st: timestamp,
                dct: timestamp,
                mm: getMouseMovements(timestamp)
            })
        })
    })).json();

    if (response.generated_pass_UUID) {
        return response.generated_pass_UUID;
    }
    const key = response.key;
    const tasks = response.tasklist;
    const job = response.request_type;
    timestamp = Date.now() + randomFromRange(30, 120);
    const answers = tasks.reduce((accum, t) => ({ ...accum, [t.task_key]: randomTrueFalse() }), {});
    const captchaResponse = {
        job_mode: job,
        answers,
        serverdomain: host,
        sitekey,
        motionData: JSON.stringify({
            st: timestamp,
            dct: timestamp,
            mm: getMouseMovements(timestamp)
        }),
        n: await hsl(response.c.req),
        c: JSON.stringify(response.c),
    };

    response = await (await fetch(`https://hcaptcha.com/checkcaptcha/${key}`, {
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
            ...headers
        },
        body: JSON.stringify(captchaResponse),
    })).json()

    if (response.generated_pass_UUID) {
        return response.generated_pass_UUID;
    }
}

/**
 * Solve an hCaptcha challenge
 * @param {string} url Site URL
 * @param {{
 *  timeout: number,
 *  maxAttempts: number,
 *  siteKey: string,
 *  retryDelay: number,
 * }} options Extra Options
 * @returns {Promise<string>} hCaptcha challange result
 */
async function solveCaptcha(url, options = {}) {
    const {
        timeout = 12000000,
        siteKey = uuid(),
        retryDelay = 0,
        maxAttempts = Infinity
    } = options;
    const { hostname } = new URL(url);
    const startingTime = Date.now();

    let retryCount = 0;
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
        if (Date.now() - startingTime > timeout) {
            throw new Error("captcha resolution timeout");
        }
        if (retryCount >= maxAttempts) {
            throw new Error("exceeded maximum attempts")
        }

        await delay(retryDelay)
        retryCount++;
    }
}

module.exports = solveCaptcha;