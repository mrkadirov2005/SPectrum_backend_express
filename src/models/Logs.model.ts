import { Schema, model, Document } from 'mongoose';

interface ILog extends Document {
  userUuid: string; // UUID of the user (client, admin, student, etc.)
  message: string;
  date: Date;
}

const logSchema = new Schema<ILog>({
  userUuid: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Log = model<ILog>('Log', logSchema);

export default Log;
