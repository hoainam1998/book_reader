const commands = require('./redis-commands');
const excludeCommands = ['get', 'set'];

const commandObj = commands.reduce((commandGroup, command) => {
  if (!excludeCommands.includes(command)) {
    commandGroup[command] = jest.fn().mockResolvedValue();
  }
  return commandGroup;
}, {});

module.exports = jest.mock('redis', () => {
  const redisOrigin = jest.requireActual('redis');

  return {
    ...redisOrigin,
    createClient: (options) => {
      const originRedisClient = redisOrigin.createClient(options);
      return Object.assign(originRedisClient, commandObj);
    },
  };
});
