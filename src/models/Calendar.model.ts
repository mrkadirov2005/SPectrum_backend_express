import mongoose, { Schema, Document } from 'mongoose';

export interface Calendar extends Document {
  uuid: string;
  time: string;
  comment: string;
  status: 'Pending' | 'Done' | 'missed';
}

const CalendarSchema: Schema = new Schema(
  {
    uuid: { type: String, required: true },
    time: { type: String },
    comment: { type: String },
    status: { type: String, enum: ['Pending', 'Done', 'missed'], default: 'Pending' },
  },
  {
    timestamps: { createdAt: true, updatedAt: 'updated_at' },
  }
);

export default mongoose.model<Calendar>('Calendar', CalendarSchema);
