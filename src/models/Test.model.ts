import mongoose, { Schema, Document } from 'mongoose';

interface Question {
  question: string;
  option: string[];
  correct: string;
}

export interface ITest extends Document {
  title: string;
  subject: string;
  test_start_password: string;
  duration: number; // in minutes (or seconds if needed)
  start_date: Date;
  end_date: Date;
  questions: Question[];
  createdBy: string; // UUID of the user who created the test
  isActive: boolean;
  uuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema<Question>(
  {
    question: { type: String, required: true },
    option: [{ type: String, required: true }],
    correct: { type: String, required: true },
  },
  { _id: false }
);

const TestSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    test_start_password: { type: String, required: true },
    duration: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    createdBy:{ type: String, required: true },
    questions: [QuestionSchema],
    isActive: { type: Boolean, default: true },
    uuid: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITest>('Test', TestSchema);
