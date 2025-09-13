import fs from "fs";
import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Create uploads folder directly in project root
const uploadDir = path.join(process.cwd(), "upload");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file (VPS can handle larger files)
    fieldSize: 50 * 1024 * 1024, // 50MB limit per field
    files: 20, // Maximum 20 files per request
  },
  fileFilter: (req, file, cb) => {
    console.log("File upload attempt:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname
    });
    
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      console.log("File accepted:", file.originalname);
      cb(null, true);
    } else {
      console.log("File rejected - not an image:", file.originalname, file.mimetype);
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Error handling middleware for multer
export const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    console.log("Multer Error:", error);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 50MB.",
        error: error.message
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 20 files per request.",
        error: error.message
      });
    }
    if (error.code === "LIMIT_FIELD_VALUE") {
      return res.status(400).json({
        success: false,
        message: "Field value too large. Maximum size is 50MB.",
        error: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: error.message
    });
  }
  
  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed",
      error: error.message
    });
  }
  
  next(error);
};
