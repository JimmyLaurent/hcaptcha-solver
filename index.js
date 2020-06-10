const request = require('request-promise-native');
const Url = require('url');
const { randomFromRange, randomTrueFalse, delay, uuid, getRandomUserAgent } = require('./src/utils');

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

async function tryToSolve(sitekey, host) {
	const userAgent = getRandomUserAgent();
	const headers = {
		'User-Agent': userAgent
	};

	let response = await request({
		method: 'post',
		headers,
		json: true,
		url: 'https://hcaptcha.com/getcaptcha',
		form: { sitekey, host }
	});

	if (response.generated_pass_UUID) {
		return response.generated_pass_UUID;
	}

	const key = response.key;
	const tasks = response.tasklist;
	const job = response.request_type;
	const timestamp = Date.now() + randomFromRange(30, 120);
	const answers = tasks.reduce((accum, t) => ({ ...accum, [t.task_key]: randomTrueFalse() }), {});
	const captchaResponse = {
		answers,
		sitekey,
		serverdomain: host,
		job_mode: job,
		motionData: {
			st: timestamp,
			dct: timestamp,
			mm: getMouseMovements()
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
  const { gentleMode, timeoutInMs } = options;
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
			if (e.response && e.response.status === 429) {
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
