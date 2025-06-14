/*eslint-disable*/
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import Meal from './meal.model';
import { IPaginationOptions } from '../../../interfaces/paginations';
import { paginationHelpers } from '../../../helpars/paginationHelper';

const createMeal = async (payload: any): Promise<any> => {
  const meal = await Meal.create(payload);
  return meal;
};

const getAllMeals = async (): Promise<any[]> => {
  return Meal.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getAllCategories = async (): Promise<string[]> => {
  const result = await Meal.find({}).select('categories');

  const allCategories = result
    .flatMap((meal) => meal.categories || []) // if categories is an array of strings
    .flatMap((cat) => cat.split(',')) // split comma-separated strings
    .map((cat) => cat.trim()) // trim spaces
    .filter((cat) => cat.length > 0); // remove empty strings

  const uniqueCategories = [...new Set(allCategories)].sort();

  return uniqueCategories;
};

const getMealsByCategory = async (
  category: string,
  options: IPaginationOptions
): Promise<any> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  console.log('category from service', category);
  const filter = {
    categories: { $in: [category] }, // ✅ Correctly matches if category exists in array
    // isDeleted: false,
  };

  const meals = await Meal.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);
  console.log(meals);

  const total = await Meal.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      total,
    },
    data: meals,
  };
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
  getAllCategories,
  getMealsByCategory,
};
