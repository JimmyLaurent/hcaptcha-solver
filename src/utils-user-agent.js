async function getUserAgent(UserAgent) {
  const params = {
    $or: [
      { failuresCount: { $lt: 10 } },
      { failuresCount: { $exists: false }}
    ]
  }
  const count = await UserAgent.count(params);
  // console.log(count);
  const randomIndex = Math.floor(Math.random() * count);
  const query = UserAgent.findOne(params).skip(randomIndex);
  const userAgent = await query.lean();
  return userAgent;
}

async function increaseUserAgentCounter(id, UserAgent) {
  return await UserAgent.findByIdAndUpdate(id, { $inc: { 'failuresCount': 1 } });
}

module.exports = { getUserAgent, increaseUserAgentCounter };