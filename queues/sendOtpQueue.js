// queues/sendOtpQueue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL);

const sendOtpQueue = new Queue("sendOtpQueue", {
  connection,
});

module.exports = sendOtpQueue;


