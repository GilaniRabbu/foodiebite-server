import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import UserController from './user.controller';
import { createUserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpars/fileUploader';

const router = express.Router();

// Create a new user
router.post(
  '/create',
  validateRequest(createUserValidation),
  UserController.createUser
);

// Dynamic route LAST
router.get('/:id', UserController.getUser);

// Update a user by ID
router.put('/:id', auth(), UserController.updateUser);

export const UserRoute = router;
