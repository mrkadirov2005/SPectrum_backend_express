import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  first_name: string;
  last_name: string;
  n_members: number;
  email: string;
  password: string;
  username:string,
  phone: string;
  is_active: boolean;
  uuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ClientSchema: Schema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    n_members: { type: Number, default: 0 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username:{type:String,required:true},
    phone: { type: String, required: true, unique: true },
    is_active: { type: Boolean, default: true },
    uuid: { type: String, required: true, unique: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IClient>('Client', ClientSchema);
