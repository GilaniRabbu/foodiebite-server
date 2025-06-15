import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MealService } from './meal.service';
import { IMeal } from './meal.interface';
import cloudinary from '../../../helpars/cloudinary';
import { IPaginationOptions } from '../../../interfaces/paginations';
import ApiError from '../../../errors/ApiErrors';

const createMeal = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const files = req.files as Express.Multer.File[];

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: 'meals',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) throw new Error('Cloudinary Upload Failed');
        }
      );

      const bufferToStream = (buffer: Buffer) => {
        const stream = require('stream');
        const readable = new stream.PassThrough();
        readable.end(buffer);
        return readable;
      };

      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) throw new Error(error.message);
        return result;
      });

      bufferToStream(file.buffer).pipe(stream);

      return new Promise<{ url: string; altText: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'meals',
              resource_type: 'image',
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve({
                url: result.secure_url,
                altText: `Image of ${payload.name || 'meal'} - ${file.originalname}`,
              });
            }
          );
          bufferToStream(file.buffer).pipe(uploadStream);
        }
      );
    })
  );

  const mealPayload = {
    ...payload,
    images: uploadedImages,
  };

  const result = await MealService.createMeal(mealPayload);

  sendResponse<IMeal>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal Created Successfully',
    data: result,
  });
});

const getAllMeals = catchAsync(async (_req: Request, res: Response) => {
  const result = await MealService.getAllMeals();
  sendResponse<IMeal[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meals retrieved successfully',
    data: result,
  });
});

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await MealService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch categories', error });
  }
};

const getMealsByCategory = catchAsync(async (req: Request, res: Response) => {
  const category = req.query.category as string;

  // if (!category) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Category is required.');
  // }

  const paginationOptions: IPaginationOptions = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined,
    sortOrder:
      req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
        ? (req.query.sortOrder as 'asc' | 'desc')
        : undefined,
  };

  const result = await MealService.getMealsByCategory(
    category,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meals retrieved successfully',
    data: result,
  });
});

const getMealById = catchAsync(async (req: Request, res: Response) => {
  const result = await MealService.getMealById(req.params.id);
  sendResponse<IMeal>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal retrieved successfully',
    data: result,
  });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const result = await MealService.updateMeal(req.params.id, req.body);
  sendResponse<IMeal>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal updated successfully',
    data: result,
  });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const result = await MealService.deleteMeal(req.params.id);
  sendResponse<IMeal>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deleted successfully',
    data: result,
  });
});

export const MealController = {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getAllCategories,
  getMealsByCategory,
};
