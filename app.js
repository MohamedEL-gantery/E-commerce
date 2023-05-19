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

const userRouter = require('./routes/userRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const subcategoryRoute = require('./routes/subcategoryRoute');
const brandRoutes = require('./routes/brandRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.use(cors());
app.options('*', cors());
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
  hpp(/*{
    whitelist: ['ratingsQuantity', 'ratingsAverage', 'price'],
  }*/)
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subcategoryRoute);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);

module.exports = app;
