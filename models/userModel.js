import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide your name'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'please provide your email'],
    },
    password: {
      type: String,
      minLength: [8, 'password should not be less than 8 characters'],
      required: [true, 'please provide your password'],
      select: false,
    },
    profileImage: {
      type: String,
    },
    roles: {
      type: [String],
      enum: ['user', 'admin'],
      default: ['user'],
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// hash password before saving in database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare plain password with hashed
userSchema.methods.comparePwdInDB = async function (plainPwd) {
  return await bcrypt.compare(plainPwd, this.password);
};

// generate crypto random token for reset password
userSchema.methods.generateCryptoToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', process.env.CRYPTO_SECRET_KEY)
    .update(token)
    .digest('hex');
  return { token, hashedToken };
};

const User = mongoose.model('User', userSchema);
export default User;
