import mongoose, { Schema, Document } from "mongoose";

interface IData extends Document {
  value: number;
  timestamp: Date;
}

const dataSchema: Schema = new Schema({
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

export default mongoose.model <IData> ("Data", dataSchema);
