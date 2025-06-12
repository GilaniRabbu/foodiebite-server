import express from 'express';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post('/create', BookingController.createBooking);

export const BookingRoutes = router;
