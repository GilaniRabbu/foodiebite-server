import express from 'express';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post('/create', BookingController.createBooking);
router.get('/:id', BookingController.getBookingById);

export const BookingRoutes = router;
