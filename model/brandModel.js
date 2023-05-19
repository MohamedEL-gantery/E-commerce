const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand required'],
      unique: [true, 'Brand must be unique'],
      minlength: [3, 'Too short Brand name'],
      maxlength: [32, 'Too long Brand name'],
    },
    slug: {
      type: String,
    },
    image: String,
  },
  { timestamps: true }
);

brandSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const imageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// create
brandSchema.post('save', function (doc) {
  imageUrl(doc);
});
// findOne, findAll and update
brandSchema.post('init', function (doc) {
  imageUrl(doc);
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
