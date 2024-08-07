const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./controllers/orderController');

// Start express app
const app = express();

app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// compress all responses
app.use(compression());

// Set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  //dev env
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 60 minutes
  message: 'Too many requests from this IP, please try again in an hour!',
});
// limiting middleware to all request
app.use('/api', limiter);

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }, { limit: '10kb' }));
app.use(cookieParser());

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

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(
    new ApiError(
      `Can't find this route ${req.originalUrl} in this server !`,
      404
    )
  );
});

// Global error handling middleware for express
app.use(globalErrorHandler);

module.exports = app;
