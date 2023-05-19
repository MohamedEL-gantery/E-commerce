const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'SubCategory must be unique'],
      minlength: [2, 'To short SubCategory name'],
      maxlength: [32, 'To long SubCategory name'],
    },
    slug: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must be belong to parent category'],
    },
  },
  { timestamps: true }
);

subCategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
