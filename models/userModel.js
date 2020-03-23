const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Enter You Username']
  },
  email: {
    type: String,
    required: [true, 'Enter A Valid Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide A Valid Email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Enter A Password'],
    minLenght: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Pleas Confirm Your Password'],
    validate: {
      // Works Only For Creat && Save
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords Don\'t match'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Only Run thi Func if Password Was Modified
  if(!this.isModified('password')) return next();

  // Hash The Password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete The PasswordConfirm Field
  this.passwordConfirm = undefined;

  next();
});

// Query Middleware for not selecting deleted users
userSchema.pre('/^find/', function(next){
  // this point to the current query
  this.find({ active: {$ne: false} });

  next();
});

userSchema.pre('save', function (next) {
  if(!this.isModified('password')|| this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimstamp) {
  if(this.passwordChangedAt) {
    const chagedTimsestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    
    console.log(chagedTimsestamp, JWTTimstamp);

    return JWTTimstamp < chagedTimsestamp
  }

  // False Means Not Changed
  return false;
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

const User =  mongoose.model('User', userSchema);

module.exports = User;