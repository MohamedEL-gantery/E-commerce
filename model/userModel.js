const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const slugify = require('slugify');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a Name'],
  },
  email: {
    type: String,
    required: [true, 'User must have a Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'PleaseProvide A Vaild Email'],
  },
  password: {
    type: String,
    required: [true, 'User Must Have A Password'],
    minLenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Provide A Vaild Password Confirm'],
    // This only works on create and SAVE !!!
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password Are Not The Same',
    },
  },
  slug: {
    type: String,
  },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, 'Please Provide A Vaild Phone'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  age: {
    type: Number,
  },
  birthDate: {
    type: Date,
    validate: [validator.isDate, 'Please Provide A Valid BirthDate'],
  },
  location: {
    type: String,
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be Male or Female',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user',
  },
  wishlist: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  addresses: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      alias: String,
      details: String,
      phone: {
        type: String,
        validate: [validator.isMobilePhone, 'Please Provide A Vaild Phone'],
      },
      city: String,
      postalCode: String,
    },
  ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetExpires: Date,
  passwordResetCode: String,
  passwordResetVerified: Boolean,
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete  passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date() - 1000;

  return next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetCode = function () {
  const restCode = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetCode = crypto
    .createHash('sha256')
    .update(restCode)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  this.passwordResetVerified = false;

  return restCode;
};

userSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
