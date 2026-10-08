import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      default: '+94 77 000 0000',
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    accountTier: {
      type: String,
      default: 'Individual / Guest',
      trim: true
    },
    accountNumber: {
      type: String,
      default: '',
      trim: true
    },
    companyName: {
      type: String,
      default: '',
      trim: true
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const User = mongoose.model('User', userSchema);
export default User;
