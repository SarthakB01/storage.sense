// app/models/fileModel.ts

export interface FileDocument {
    _id?: string; // Optional, MongoDB will automatically generate this
    filename: string;
    size: number;
    type: string;
    uploadDate: Date;
  }
  
  