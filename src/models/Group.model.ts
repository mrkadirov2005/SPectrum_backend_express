import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  uuid: string;
  number_of_students: number;
  activity_rate: number;
  payment_rate: number;
  client_id: string;
  isActive: boolean;
  createdAt: Date; // Explicitly added
  updatedAt: Date; // Explicitly added
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    number_of_students: { type: Number, default: 0 },
    activity_rate: { type: Number, default: 0 },
    payment_rate: { type: Number, default: 0 },
    client_id: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // This auto-generates createdAt and updatedAt
  }
);

export default mongoose.model<IGroup>('Group', GroupSchema);
