function randomFromRange(start, end) {
  return Math.round(Math.random() * (end - start) + start);
}

function randomTrueFalse() {
  return randomFromRange(0, 1) ? 'true' : 'false';
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function uuid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}

function getRandomUserAgent() {
  // TODO
  return 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36';
}

module.exports = { randomFromRange, randomTrueFalse, delay, uuid, getRandomUserAgent };
