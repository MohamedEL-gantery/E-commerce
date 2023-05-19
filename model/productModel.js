const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Product must have a quantity '],
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, 'Product must have a image cover'],
    },
    price: {
      type: String,
      trquired: [true, 'Product must have a price'],
    },
    priceDiscount: {
      type: String,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be bellow reqular price',
      },
    },
    colors: [String],
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category'],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name -_id',
  });
  next();
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const imageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

// findOne, findAll and update
productSchema.post('init', function (doc) {
  imageUrl(doc);
});

// create
productSchema.post('save', function (doc) {
  imageUrl(doc);
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
