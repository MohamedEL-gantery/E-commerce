const userRouter = require('./userRoutes');
const categoryRouter = require('./categoryRoutes');
const subcategoryRoute = require('./subcategoryRoutes');
const brandRoutes = require('./brandRoutes');
const productRouter = require('./productRoutes');
const reviewRouter = require('./reviewRoutes');
const wishlistRouter = require('./wishlistRoutes');
const addressRouter = require('./addressRoutes');
const couponRouter = require('./couponRoutes');
const cartRouter = require('./cartRoutes');

const mountRoutes = (app) => {
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/subcategories', subcategoryRoute);
  app.use('/api/v1/brands', brandRoutes);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/coupons', couponRouter);
  app.use('/api/v1/cart', cartRouter);
};

module.exports = mountRoutes;
