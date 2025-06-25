import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Booking from './booking.model';
import mongoose, { Types } from 'mongoose';
import Meal from '../Meal/meal.model';
import User from '../User/user.model';
import { IPaginationOptions } from '../../../interfaces/paginations';
import { paginationHelpers } from '../../../helpars/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';

const createBooking = async (payload: any): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mealIds, userId, ...rest } = payload;

    // Validate mealIds array
    if (!Array.isArray(mealIds) || mealIds.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No mealIds provided.');
    }

    // Validate ObjectIds
    const areValidIds = mealIds.every((id: string) =>
      Types.ObjectId.isValid(id)
    );
    if (!areValidIds) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'One or more mealIds are invalid.'
      );
    }

    // Fetch and verify meals from DB
    const meals = await Meal.find({
      _id: { $in: mealIds },
      isDeleted: false,
    }).session(session);

    if (meals.length !== mealIds.length) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'One or more selected meals were not found.'
      );
    }

    // Optional: validate user
    if (userId) {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }
    }

    // Group meals by type
    const mealsByType: Record<string, { ids: string[]; total: number }> = {};
    meals.forEach((meal) => {
      const type = meal.type;
      if (!mealsByType[type]) {
        mealsByType[type] = { ids: [], total: 0 };
      }
      mealsByType[type].ids.push(meal._id.toString());
      mealsByType[type].total += Number(meal.price);
    });

    // Create bookings and build return structure
    const createdBookings = await Promise.all(
      Object.entries(mealsByType).map(async ([type, data]) => {
        const [createdBooking] = await Booking.create(
          [
            {
              ...rest,
              userId,
              mealIds: data.ids,
              type,
              total: data.total,
              status: 'PENDING',
            },
          ],
          { session }
        );

        return createdBooking;
      })
    );
    await session.commitTransaction();
    session.endSession();
    return createdBookings.map((booking) => booking._id);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getBookingById = async (id: string): Promise<any> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid booking ID');
  }

  const booking = await Booking.findById(id)
    .populate({
      path: 'mealIds',
      select: 'name price type description',
    })
    .lean();

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  return booking;
};

const getAllBookings = async (
  queryParams: any
): Promise<IGenericResponse<any[]>> => {
  // Apply pagination
  const paginationOptions: IPaginationOptions = {
    page: Number(queryParams.page) || 1,
    limit: Number(queryParams.limit) || 10,
    sortBy: queryParams.sortBy || 'createdAt',
    sortOrder: queryParams.sortOrder || 'desc',
  };

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: any[] = [];

  // Ensure type safety on - && typeof queryParams.status === 'string'
  if (queryParams.status && typeof queryParams.status === 'string') {
    andConditions.push({ status: queryParams.status });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Booking.find(whereConditions)
    .populate('mealIds') // if needed
    .populate('userId') // optional
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const BookingService = {
  createBooking,
  getBookingById,
  getAllBookings,
};
