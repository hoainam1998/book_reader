const { createClient } = require('redis');

const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.log);

module.exports = redisClient;
