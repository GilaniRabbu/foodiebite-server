import express from 'express';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post('/create', BookingController.createBooking);
router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.get('/user/:userId', BookingController.getBookingsByUserId);

export const BookingRoutes = router;
