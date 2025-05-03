import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Salary extends Document {
    uuid:string;
    addedBy:string,
    fixed:number;
    KPI:number;
    total:number;
    period:string;
    status:string;
    date:string;
    updatedAt:string
}

const StaffSchema: Schema = new Schema(
  {
   uuid:{type:String,required:true},
   addedBy:{type:String,required:true},
   fixed:{type:Number,required:true},
   KPI:{type:Number,required:true},
   total:{type:Number,required:true},
   period:{type:String,required:true},
   status:{type:String,required:true,enum:["Pending","paid","Late"]},
   date:{type:String,required:true},
   updatedAt:{type:String,required:true}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Salary>('Salary', StaffSchema);
