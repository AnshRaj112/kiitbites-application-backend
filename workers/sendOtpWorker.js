// workers/sendOtpWorker.js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const sendOtpEmail = require("../utils/sendOtp");
const logger = require("../utils/logger");

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

const worker = new Worker(
  "sendOtpQueue",
  async (job) => {
    const { email, otp } = job.data;
    await sendOtpEmail(email, otp);
    logger.info(`✅ OTP sent to ${email}`);
  },
  { connection }
);

worker.on("completed", (job) => {
  logger.info(`🎉 Job completed for ${job.id}`);
});

worker.on("failed", (job, err) => {
  logger.error(`❌ Job failed for ${job.id}:`, err);
});
