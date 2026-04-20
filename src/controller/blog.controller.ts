import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import Blog from "../models/blog.model";
import { blogSchema } from "./blog.schema";
import { validateFileType, uploadToCloudinary } from "../middleware/upload";

export async function createBlog(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required.",
      });
    }

    const result = blogSchema().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data.",
      });
    }

    const { title, description } = result.data;

    const file = req.file;

    // Validate file type using magic bytes
    const isValidType = await validateFileType(file.buffer);
    if (!isValidType) {
      return res.status(400).json({
        message: "Invalid file type. Only images are allowed.",
      });
    }

    // Upload to Cloudinary with UUID filename
    const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);

    const blog = await Blog.create({
      title,
      description,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
      postedBy: (req as any).user.id,
    });

    return res.status(201).json({
      message: "Blog created successfully.",
      blog,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function fetchBlogs(req: Request, res: Response) {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Blogs fetched successfully.",
      blogs,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function deleteBlog(req: Request, res: Response) {
  try {
    const blogId = req.params.id;
    const authorId = (req as any).user.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(400).json({
        message: "Blog is not found.",
      });
    }

    if (!blog.postedBy.equals(authorId)) {
      return res.status(400).json({
        message: "You are not authorized to delete this blog.",
      });
    }

    if (blog.image && blog.image.publicId) {
      await cloudinary.uploader.destroy(blog.image.publicId);
    }

    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json({
      message: "Blog deleted successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}
