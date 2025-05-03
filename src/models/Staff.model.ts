import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  position: string;
  isActive: boolean;
  schedule: string[]; // or you can use a more structured object/array if needed
  accessModule: string[]; // e.g., ['attendance', 'test', 'payment']
  attendance: Types.ObjectId[]; // reference to Attendance collection
  adminId: string; // ref to Admin or Client
  uuid: string;
  survay: string[]; // assuming it's a list of survey responses/ids
  createdAt?: Date;
  updatedAt?: Date;
}

const StaffSchema: Schema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    schedule: [{ type: String }], // refine to objects if schedule is complex
    accessModule: [{ type: String }],
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    adminId: { type: String }, // or 'Client' if needed
    uuid: { type: String, required: true, unique: true },
    survay: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStaff>('Staff', StaffSchema);
