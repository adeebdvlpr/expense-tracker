const mongoose = require('mongoose');

// Cache the connection across serverless function invocations.
// global.mongooseCache persists between warm-lambda calls; a fresh invocation
// that shares the same container reuses the existing connection instead of
// opening a new one, which prevents MongoDB "Too Many Connections" errors.
let cached = global.mongooseCache || null;

async function connectDB() {
  if (cached && cached.conn) return cached.conn;

  if (!cached || !cached.promise) {
    const opts = {
      // Fail immediately if the connection isn't ready instead of silently
      // buffering operations — makes misconfiguration visible early.
      bufferCommands: false,
    };

    const promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log('Connected to MongoDB');
        return conn;
      });

    cached = { conn: null, promise };
    global.mongooseCache = cached;
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
