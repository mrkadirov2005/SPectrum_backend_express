import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  uuid: string;
  email: string;
  password: string;
  username: string;
  is_active: boolean;
  accessible_groups_list: string[]; // or ObjectId[] if referencing another collection
  logs:string[];
  client_id: string;
  createdAt?: Date;
  updated_at?: Date;
}

const AdminSchema: Schema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    client_id: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    logs:{type:[{type:String}],required:true},
    accessible_groups_list: [{ type: String }], // or ObjectId if referencing
  },
  {
    timestamps: { createdAt: true, updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);

