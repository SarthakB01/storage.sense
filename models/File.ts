import mongoose, { Document, Schema } from 'mongoose';

interface IFile extends Document {
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
}

const fileSchema: Schema = new Schema(
  {
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const File = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
