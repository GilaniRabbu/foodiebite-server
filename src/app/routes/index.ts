import express from 'express';
import { AuthRoute } from '../modules/Auth/auth.route';
import { UserRoute } from '../modules/User/user.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { MealRoutes } from '../modules/Meal/meal.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoute,
  },

  {
    path: '/auth',
    route: AuthRoute,
  },

  {
    path: '/meals',
    route: MealRoutes,
  },

  {
    path: '/booking',
    route: BookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
