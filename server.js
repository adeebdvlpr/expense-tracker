// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const { auth } = require('express-openid-connect');
// const authRoutes = require('./routes/auth');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Auth0 configuration
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0_SECRET,
//   baseURL: process.env.AUTH0_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
// };

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(auth(config));

// // Auth0 route
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

// // Routes
// // app.use('/api/auth', authRoutes);
// // app.use('/api/expenses', require('./routes/expenses'));

// const connectToDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
//       socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
//     });
//     console.log('Successfully connected to MongoDB!');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     process.exit(1);
//   }
// };

// connectToDatabase();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/expenses', require('./routes/expenses'));


// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Something went wrong on the server',
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed');
//   process.exit(0);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const authRoutes = require('./routes/auth');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/expenses', require('./routes/expenses'));

// const connectToDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000,
//       socketTimeoutMS: 45000,
//     });
//     console.log('Successfully connected to MongoDB!');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     process.exit(1);
//   }
// };

// connectToDatabase();

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Something went wrong on the server',
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed');
//   process.exit(0);
// });

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// app.use(cors());
app.use(cors({
  origin: 'https://ad-expense-tracker-16896725c6ee.herokuapp.com/',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});