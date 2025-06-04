import path from 'path';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MealService } from './meal.service';
import { IMeal } from './meal.interface';
import cloudinary from '../../../helpars/cloudinary';

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
};
