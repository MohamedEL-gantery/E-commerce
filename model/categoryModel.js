const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const imageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

// findOne, findAll and update
categorySchema.post('init', function (doc) {
  imageUrl(doc);
});

// create
categorySchema.post('save', function (doc) {
  imageUrl(doc);
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
