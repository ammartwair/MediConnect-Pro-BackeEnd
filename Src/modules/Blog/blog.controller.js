import slugify from "slugify";
import blogModel from "../../../DB/Model/Blog.Model.js";
import cloudinary from "../../services/cloudinary.js";
import { Filter } from "../../services/filter.js";
import { pagination } from "../../services/pagination.js";

//create a new blog:
export const createBlog = async (req, res, next) => {
  const { title } = req.body;
  let blog = await blogModel.findOne({ title });

  if (blog) {
    return res.json({ message: "Blog is already created" });
  }

  req.body.slug = slugify(title);

  req.body.createdBy = req.user._id;
  req.body.updatedBy = req.user._id;

  blog = await blogModel.create(req.body);

  if (!blog) {
    return res.json({ message: "Error Occured While Creating Blog" });
  }

  return res.status(200).json({ message: "Blog Created", blog });
};

// get blogs:
export const getBlogs = async (req, res, next) => {
  // const { skip, limit } = pagination(req.query.page, req.query.limit);

  // filter
  const queryObject = Filter({ ...req.query });

  const mongooseQuery = await blogModel
    .find(queryObject)
    // .skip(skip)
    // .limit(limit)
    .populate('createdBy');

  const blogs = mongooseQuery;
  console.log(blogs);
  if (!blogs || blogs.length == 0) {
    return res.json({ message: "No Blogs" });
  }
  const blogsWithUsernames = blogs.map(blog => ({
    ...blog.toJSON(),
    userName: blog.createdBy.userName
  }));


  return res.status(200).json({ message: "success", blogsWithUsernames });
};

// get specific blog by name:
export const getBlogByName = async (req, res, next) => {
  const blog = await blogModel.findOne({ title: req.params.title });
  if (!blog) {
    return next(
      new Error(`There is no Blog with title ${req.params.title} `, {
        status: 404,
      })
    );
  }
  return res.status(200).json({ message: "success", blog });
};

//update specific blog:
export const updateBlog = async (req, res, next) => {
  const blog = await blogModel.findOne({ _id: req.params.blogId });

  if (!blog) {
    return next(
      new Error(`There is no Blog with id ${req.params.blogId}`, {
        status: 404,
      })
    );
  }

  if (req.body.title) {
    if (
      await blogModel.findOne({
        title: req.body.title,
        _id: { $ne: blog._id },
      })
    ) {
      return next(
        new Error(`Blog ${req.body.title} alreqdy exists!`, { status: 409 })
      );
    }
    blog.title = req.body.title;
    blog.slug = slugify(blog.title);
  }

  if (req.body.blogText) {
    blog.blogText = req.body.blogText;
  }

  if (req.files) {
    blog.images = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.APP_NAME}/blogs/${req.body.title}`,
        }
      );
      blog.images.push({ secure_url, public_id });
    }
  }

  blog.updatedBy = req.user._id;
  await blog.save();
  return res.status(200).json({ message: "success", blog });
};

//delete a blog:
export const deleteBlog = async (req, res, next) => {
  const blog = await blogModel.findByIdAndDelete({ _id: req.params.blogId });

  if (!blog) {
    return next(
      new Error(`There is no Blog with id ${req.params.blogId}`, {
        status: 404,
      })
    );
  }

  return res.status(200).json({ message: "success", blog });
};

//delete all Blogs:
export const deleteBlogs = async (req, res, next) => {
  const blogs = await blogModel.deleteMany({});

  if (!blogs) {
    return next(new Error("There is no Blogs!!", { status: 404 }));
  }

  return res.status(200).json({ message: "success", blogs });
};
