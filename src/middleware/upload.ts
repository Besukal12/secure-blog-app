import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import cloudinary from "../config/cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

const storage = multer.memoryStorage();

const checkFileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images are allowed.") as any, false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, 
  },
});

export const validateFileType = async (buffer: Buffer): Promise<boolean> => {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType ? fileType.mime.startsWith("image/") : false;
  } catch {
    return false;
  }
};

export const uploadToCloudinary = async (buffer: Buffer, originalName: string) => {
  const publicId = uuidv4(); 
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${buffer.toString("base64")}`,
    {
      folder: "blog-images",
      public_id: publicId,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    }
  );
  return result;
};

export default upload;