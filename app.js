const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const routes = require('./routes');

const app = express();

app.use(cors());
app.options('*', cors());

// compress all responses
app.use(compression());

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 60 minutes
  message: 'Too many requests from this IP, please try again in an hour!',
});
// Apply the reat limiting middleware to all request
app.use('/api', limiter);

app.use(express.static(path.join(__dirname, 'public')));
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }, { limit: '10kb' }));
app.use(cookieParser());

// development logging
if (process.env.NODE_ENV === 'development') {
  //dev env
  app.use(morgan('dev'));
}

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'price',
      'sold',
      'quantity',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
routes(app);

app.all('*', (req, res, next) => {
  return next(
    new AppError(`Cant find ${req.originalUrl} on this server `, 404)
  );
});

// Global error handling middleware for express
app.use(globalErrorHandler);

module.exports = app;
