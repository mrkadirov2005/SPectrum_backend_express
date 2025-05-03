import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  content: string;
  target_id:string; // this can reference a user, client, etc.
  given_date: Date;
  deadline: Date;
  status: 'pending' | 'in progress' | 'completed'; // task status
  givenBy:string,
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    target_id: {type:String,required:true}, // replace 'User' with actual target collection name
    given_date: { type: Date, required: true },
    givenBy:{type:String,required:true},
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed'],
      default: 'pending', // default status is 'pending'
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
