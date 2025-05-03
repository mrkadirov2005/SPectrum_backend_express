import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  createdAt: Date;
  targetId: string; // the user (staff or student) the comment is for
  content: string;
  createdBy: string; // the user (admin or client) who created the comment

}

const CommentSchema: Schema = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    targetId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IComment>('Comment', CommentSchema);
