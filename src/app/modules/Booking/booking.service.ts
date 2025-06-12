import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Booking from './booking.model';
import { Types } from 'mongoose';
import Meal from '../Meal/meal.model';
import User from '../User/user.model';

const createBooking = async (payload: any): Promise<any> => {
  const { mealIds, userId, ...rest } = payload;

  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  }

  // Check if all mealIds are valid ObjectIds
  const areValidIds = mealIds.every((id: string) => Types.ObjectId.isValid(id));
  if (!areValidIds) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'One or more mealIds are invalid.'
    );
  }

  // Check if all mealIds exist in Meal collection
  const existingMeals = await Meal.find({
    _id: { $in: mealIds },
    isDeleted: false,
  });

  if (existingMeals.length !== mealIds.length) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'One or more selected meals were not found.'
    );
  }

  const booking = await Booking.create({ mealIds, ...rest });
  return booking;
};

export const BookingService = {
  createBooking,
};
