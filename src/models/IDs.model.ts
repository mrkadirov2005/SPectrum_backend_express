import { Schema, model } from 'mongoose';

const idsSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['Admin', 'Staff', 'Client', 'Student'], default: 'Client' },
}, { timestamps: true });

const Ids = model('Ids', idsSchema);

export default Ids;  // Make sure to use `export default` to properly export the model
