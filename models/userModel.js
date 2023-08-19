import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
      required: [true, 'please provide password'],
      minLength: 8,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// hash password before saving document into database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
});

// compare plain password with hashed
userSchema.methods.isPasswordMatch = async function (plainPwd, hashPwd) {
  return await bcrypt.compare(plainPwd, hashPwd);
};

const User = mongoose.model('User', userSchema);

export default User;
