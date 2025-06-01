import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'USER', 'CUSTOMER', 'DINMAJUR'],
      required: true,
      default: 'USER',
    },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    userStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'DELETED'],
      default: 'PENDING',
    },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    otp: { type: Number },
    otpExpiry: { type: Date },
    otpToken: { type: String },
    dateOfBirth: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ userStatus: 1 });
UserSchema.index({ role: 1 });

const User = model('User', UserSchema);

export default User;
