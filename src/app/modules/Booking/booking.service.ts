import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Booking from './booking.model';
import { Types } from 'mongoose';
import Meal from '../Meal/meal.model';
import User from '../User/user.model';
import mongoose from 'mongoose';

const createBooking = async (
  payload: any
): Promise<{ type: string; total: number }[]> => {
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
    const bookings = await Promise.all(
      Object.entries(mealsByType).map(async ([type, data]) => {
        await Booking.create(
          [
            {
              ...rest,
              userId,
              mealIds: data.ids,
              type,
              total: data.total,
            },
          ],
          { session }
        );

        return { type, total: data.total };
      })
    );

    await session.commitTransaction();
    session.endSession();

    return bookings; // Only [{ type, total }, ...]
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const BookingService = {
  createBooking,
};
