const { URLSearchParams } = require("url");

function encodeFormData(data) {
    return (new URLSearchParams(data)).toString();
}

function randomFromRange(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}

function randomTrueFalse() {
    return randomFromRange(0, 1) ? 'true' : 'false';
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function uuid(a) {
    return a ?
        (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) :
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}

const userAgents = ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36', 'Mozilla/5.0 (iPad; U; CPU OS 5_1 like Mac OS X) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10 UCBrowser/3.4.3.532'];

function getRandomUserAgent() {
    // TODO
    return userAgents[Math.floor(Math.random() * userAgents.length)]
}

module.exports = {
    randomFromRange,
    randomTrueFalse,
    delay,
    uuid,
    getRandomUserAgent,
    encodeFormData
};