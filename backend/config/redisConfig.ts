import { createClient } from 'redis';

const redisClient = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
});

// Connect function to be called at application startup
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis connection established');

        // Test connection
        await redisClient.set('connection_test', 'success');
        await redisClient.get('connection_test');

        return true;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        return false;
    }
};

export { redisClient, connectRedis };