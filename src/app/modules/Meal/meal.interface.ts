import { Document, Types } from 'mongoose';

export interface IMeal extends Document {
  name: string;
  description?: string;
  categories?: string[];
  keywords?: string[];
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'DESSERT';
  images: string[];
  ingredients?: string[];
  price: number;
  isAvailable: boolean;
  mealStatus: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  userId: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
