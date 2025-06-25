import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import UserController from './user.controller';
import { createUserValidation } from './user.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

// Create a new user
router.post(
  '/create',
  validateRequest(createUserValidation),
  UserController.createUser
);

// Get all users
router.get('/', UserController.getAllUsers);

// Dynamic route get user by id
router.get('/:id', UserController.getUser);

// Update a user by id
router.put('/:id', auth(), UserController.updateUser);

export const UserRoute = router;
