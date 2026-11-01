import express from 'express';
import auth from '../../middlewares/auth';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post('/create', BookingController.createBooking);
router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.get('/user/:userId', BookingController.getBookingsByUserId);
router.patch(
  '/:id/status',
  auth('ADMIN'),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
