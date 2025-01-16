// FileDocument interface to define metadata structure
export interface FileDocument {
  _id?: string; // MongoDB's unique identifier
  filename: string; // File name
  size: number; // File size in bytes
  type: string; // MIME type (e.g., image/jpeg)
  uploadDate: Date; // Upload date and time
}
