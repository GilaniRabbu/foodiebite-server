import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiErrors';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.createUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User Created Successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  console.log('check user Id', userId);
  const payload = { ...req.body };

  if ('password' in payload) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password update is not allowed through this route'
    );
  }

  const updatedUser = await UserService.updateUser(userId, payload);

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found or update failed');
  }

  const { password, ...userData } = updatedUser.toObject();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Updated Successfully',
    data: userData,
  });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUser(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }

  const { password, ...rest } = user.toObject();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Fetched Successfully',
    data: rest,
  });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users Fetched Successfully',
    data: users,
  });
});

// Delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Deleted Successfully',
    data: null,
  });
});

const UserController = {
  createUser,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
};

export default UserController;
