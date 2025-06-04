/*eslint-disable*/
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Meal from './meal.model';
import { IMeal } from './meal.interface';

const createMeal = async (payload: any): Promise<any> => {
  const meal = await Meal.create(payload);
  return meal;
};

const getAllMeals = async (): Promise<any[]> => {
  return Meal.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getMealById = async (id: string): Promise<any> => {
  const meal = await Meal.findById(id);
  if (!meal || meal.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
  }
  return meal;
};

const updateMeal = async (id: string, payload: any): Promise<any> => {
  const meal = await Meal.findByIdAndUpdate(id, payload, { new: true });
  if (!meal || meal.isDeleted) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Meal not found or already deleted'
    );
  }
  return meal;
};

const deleteMeal = async (id: string): Promise<any> => {
  const meal = await Meal.findByIdAndUpdate(
    id,
    { isDeleted: true, mealStatus: 'DELETED', deletedAt: new Date() },
    { new: true }
  );
  if (!meal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meal not found');
  }
  return meal;
};

export const MealService = {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
};
