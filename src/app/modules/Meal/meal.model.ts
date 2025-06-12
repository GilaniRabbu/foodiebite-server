import { Schema, model } from 'mongoose';

const MealSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT'],
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String, required: true },
      },
    ],
    // ingredients: [{ type: String }],
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    // mealStatus: {
    //   type: String,
    //   enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    //   default: 'ACTIVE',
    // },
    // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // user who created the meal
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
MealSchema.index({ type: 1 });
MealSchema.index({ mealStatus: 1 });
MealSchema.index({ isAvailable: 1 });
MealSchema.index({ userId: 1 });

const Meal = model('Meal', MealSchema);

export default Meal;
