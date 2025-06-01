/*eslint-disable*/

import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import config from '../../../config';
import { ObjectId } from 'mongodb';
import emailSender from '../../../helpars/emailSender';
import User from './user.model'; // Mongoose model
import { UserStatus } from '../../../constants';
import formatPhoneNumber from '../../../helpars/phoneHelper';
import axios from 'axios';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import { Secret } from 'jsonwebtoken';
import mongoose from 'mongoose';

const createUser = async (payload: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email: string;
}) => {
  const { firstName, lastName, phone, password, email } = payload;
  const formattedPhone = formatPhoneNumber(phone);

  const existingUser = await User.findOne({ phone: formattedPhone, email });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Already Exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    phone: formattedPhone,
    password: hashedPassword,
    email,
    userStatus: UserStatus.ACTIVE,
  });

  await newUser.save();
  return {
    user: {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      email: newUser.email,
    },
  };
};

const updateUser = async (userId: string, payload: Partial<typeof User>) => {
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getUser = async (id: string) => {
  const user = await User.findById(id).select('_id phone email role'); // Select specific fields

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

// Get All Users
const getAllUsers = async () => {
  const users = await User.find({ isDeleted: false }); // Fetch non-deleted users

  return users;
};

// Delete User
const deleteUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export const UserService = {
  createUser,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
};

// const uploadProfilePicture = async (
//   userId: string,
//   profilePicture: { url: string; altText: string }
// ) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   // Update or create profile with picture
//   const profile = await Profile.findOneAndUpdate(
//     { userId },
//     { profilePicture },
//     { upsert: true, new: true }
//   );

//   return profile;
// };
