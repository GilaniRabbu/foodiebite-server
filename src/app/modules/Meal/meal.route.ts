import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { MealController } from './meal.controller';
import { createMealSchema, updateMealSchema } from './meal.validation';
import { fileUploader } from '../../../helpars/fileUploader';

const router = express.Router();

router.post(
  '/create',
  fileUploader.uploadMultipleImages,
  //   validateRequest(createMealSchema),
  MealController.createMeal
);

router.get('/', MealController.getAllMeals);
router.get('/:id', MealController.getMealById);

router.patch(
  '/:id',
  validateRequest(updateMealSchema),
  MealController.updateMeal
);

router.delete('/:id', MealController.deleteMeal);

export const MealRoutes = router;
