import mongoose, { Schema, Document, Types } from 'mongoose';

interface TestResult {
  test_name: string;
  result: string | number;
  date: string; // can also use Date type if consistent
}

export interface IStudent extends Document {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  username: string;
  courses: string[]; // or ObjectId[] if referencing Courses collection
  attendance: Record<string, number | false>; // e.g., {"25/04/25": 90}
  grades: string[]; // or a more structured format
  group_id: Types.ObjectId;
  uuid: string;
  test_result: TestResult[];
  createdAt?: Date;
  updatedAt?: Date;
}

const TestResultSchema = new Schema<TestResult>(
  {
    test_name: { type: String, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const StudentSchema: Schema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    courses: [{ type: String }], // or ObjectId with ref: 'Course'
    attendance: { type: Map, of: Schema.Types.Mixed, default: {} },
    grades: [{ type: String }],
    group_id: {type:String,required:true },
    uuid: { type: String, required: true, unique: true },
    test_result: [{type:Object, required: true, default: []}],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
