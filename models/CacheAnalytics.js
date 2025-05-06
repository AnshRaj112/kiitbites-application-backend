const mongoose = require('mongoose');
const { Cluster_Cache_Analytics } = require('../config/db');

const cacheAnalyticsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: String,
    enum: ['cache', 'analytics'],
    default: 'cache',
  },
  ttl: {
    type: Date, // optional expiry
    default: () => new Date(Date.now() + 10 * 60 * 1000), // default 10 min
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Optional: Auto-delete after TTL (if using MongoDB TTL Index)
cacheAnalyticsSchema.index({ ttl: 1 }, { expireAfterSeconds: 0 });

module.exports = Cluster_Cache_Analytics.model('CacheAnalytics', cacheAnalyticsSchema);
