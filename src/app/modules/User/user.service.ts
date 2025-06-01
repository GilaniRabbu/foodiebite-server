/*eslint-disable*/

import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import User from './user.model'; // Mongoose model
import { UserStatus } from '../../../constants';
import formatPhoneNumber from '../../../helpars/phoneHelper';

const createUser = async (payload: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}) => {
  const { firstName, lastName, phone, email, password } = payload;
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
    email,
    password: hashedPassword,
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
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
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
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
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
