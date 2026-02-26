const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const userRoutes = require('./routes/users.js');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goals');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();


const crypto = require('crypto');

// If you're behind Heroku/Render/NGINX, this helps IP + rate limit accuracy
app.set('trust proxy', 1);
// Correlation ID middleware (Request ID)
app.use((req, res, next) => {
  // Respect upstream request id if present (useful behind proxies)
  const incomingId = req.header('x-request-id');
  const requestId = incomingId || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId); // client sees it too

  next();
});

// Security headers
app.use(helmet());

// Logging (dev-friendly locally, more detailed in prod)
morgan.token('requestId', (req) => req.requestId);
const isProd = process.env.NODE_ENV === 'production';
app.use(
  morgan(
    isProd
      // production: more complete + correlation ID
      ? ':requestId :remote-addr - :method :url :status :res[content-length] - :response-time ms ":user-agent"'
      // dev: readable + correlation ID
      : ':requestId :method :url :status - :response-time ms',
  )
);

const PORT = process.env.PORT || 5001;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser tools (like curl/postman) that don't send Origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: false, // header-based JWT auth, no cookies needed
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'x-request-id']
}));


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});

// limiter 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                 // 20 requests per IP per window
  standardHeaders: true,   // adds RateLimit-* headers
  legacyHeaders: false,    // disables X-RateLimit-* headers
  message: { message: 'Too many auth attempts. Please try again later.' },
});
// Update the route paths
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(`[${req.requestId}]`, err.stack || err);
  res.status(500).json({ message: 'Internal server error', requestId: req.requestId });
});


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;