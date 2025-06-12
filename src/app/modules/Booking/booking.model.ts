import { Schema, model } from 'mongoose';

const BookingSchema = new Schema(
  {
    mealIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Meal',
        required: true,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    numberOfGuests: { type: Number, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true }, // e.g., '7:00 PM'

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
BookingSchema.index({ userId: 1 });
BookingSchema.index({ reservationDate: 1, reservationTime: 1 });

const Booking = model('Booking', BookingSchema);

export default Booking;
