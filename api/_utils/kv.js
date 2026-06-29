import Redis from 'ioredis';

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;
  
  const url = process.env.KV_REDIS_URL;
  if (!url) return null;
  
  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: null,
      connectTimeout: 5000
    });
    return redisClient;
  } catch (err) {
    console.error('Error creating Redis client:', err);
    return null;
  }
}

export async function kvCall(command, args = []) {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const cmd = command.toLowerCase();
    
    if (cmd === 'get') {
      return await client.get(args[0]);
    } else if (cmd === 'set') {
      return await client.set(args[0], args[1]);
    } else {
      return await client.call(command, ...args);
    }
  } catch (err) {
    console.error(`Redis error executing ${command}:`, err);
    return null;
  }
}
