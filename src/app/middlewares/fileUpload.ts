import { Request, Response, NextFunction } from 'express';
import { upload } from '../utils/upload';

export const handleFileUpload = (fieldName: string = 'file') => {
  return [
    upload.single(fieldName),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      
      // Handle file upload
      if (req.file) {
        const backendUrl = process.env.BACKEND_URL || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        req.body.image = `${baseUrl}/upload/${req.file.filename}`;
      }
      
      next();
    }
  ];
};
