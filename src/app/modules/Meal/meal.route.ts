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

// Nullify all categories
// router.patch('/nullify-categories', MealController.nullifyAllMealCategories);
// router.put('/bulk-update-categories', MealController.updateMultipleMealCategories);

router.get('/categories', MealController.getAllCategories);
router.get('/meals-by-category', MealController.getMealsByCategory);
router.get('/', MealController.getAllMeals);
router.get('/:id', MealController.getMealById);

router.patch(
  '/:id',
  validateRequest(updateMealSchema),
  MealController.updateMeal
);

router.delete('/:id', MealController.deleteMeal);

export const MealRoutes = router;
