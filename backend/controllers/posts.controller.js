console.log("Cloudinary config check:", {
  cloud: !!process.env.CLOUDINARY_CLOUD_NAME,
  key: !!process.env.CLOUDINARY_API_KEY,
  secret: !!process.env.CLOUDINARY_API_SECRET,
});

import Comment from "../models/comments.model.js";
import Like from "../models/likes.model.js";
import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import { uploadFile } from "../config/upload.js";

const MAX_LIMIT = 50;

const getToken = (req) =>
  req.headers.authorization || req.query.token || req.body?.token || "";

const getPagination = (req, defaultLimit = 20) => {
  const page = Math.max(parseInt(req.query.page || req.body?.page || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || req.body?.limit || `${defaultLimit}`, 10), 1),
    MAX_LIMIT
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;
const getBaseUrl = (req) => `https://${req.get("host")}`;

const withMediaUrl = (req, post) => {
  const plainPost = post.toObject ? post.toObject() : post;
  const media = plainPost.media || "";
  const mediaUrl =
    plainPost.mediaUrl ||
    (media.startsWith("http") ? media : media ? `${getBaseUrl(req)}/${media}` : "");
  const likeCount = plainPost.likeCount ?? plainPost.likes ?? 0;

  return {
    ...plainPost,
    mediaUrl,
    likeCount,
    likes: likeCount,
    commentCount: plainPost.commentCount || 0,
  };
};

const findUserByToken = async (token) => {
  if (!token) return null;
  return User.findOne({ token }).select("_id name username email profilePicture").lean();
};

const addLikedState = async (posts, user) => {
  if (!user || posts.length === 0) {
    return posts.map((post) => ({ ...post, likedByMe: false }));
  }

  const likedPostIds = await Like.find({
    userId: user._id,
    postId: { $in: posts.map((post) => post._id) },
  })
    .select("postId")
    .lean();

  const likedSet = new Set(likedPostIds.map((like) => String(like.postId)));

  return posts.map((post) => ({
    ...post,
    likedByMe: likedSet.has(String(post._id)),
  }));
};

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  const { token, body } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const trimmedBody = body?.trim();
    if (!trimmedBody && !req.file) {
      return res.status(400).json({ message: "Write something or attach a file" });
    }

    const uploaded = await uploadFile(req.file, "fynk/posts");

    const post = await Post.create({
      userId: user._id,
      body: trimmedBody || "",
      media: uploaded.media,
      mediaUrl: uploaded.mediaUrl,
      mediaPublicId: uploaded.mediaPublicId,
      fileType: uploaded.fileType,
      storageProvider: uploaded.storageProvider,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  const { page, limit, skip } = getPagination(req);

  try {
    const token = getToken(req);
    const currentUser = await findUserByToken(token);

    const [rawPosts, total] = await Promise.all([
      Post.find({ active: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username email profilePicture")
        .lean(),
      Post.countDocuments({ active: true }),
    ]);

    const normalizedPosts = rawPosts.map((post) => withMediaUrl(req, post));
    const posts = await addLikedState(normalizedPosts, currentUser);

    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostsByUser = async (req, res) => {
  const { username } = req.params;
  const { page, limit, skip } = getPagination(req, 12);

  try {
    const profileUser = await User.findOne({ username })
      .select("_id name username email profilePicture")
      .lean();

    if (!profileUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await findUserByToken(getToken(req));

    const [rawPosts, total] = await Promise.all([
      Post.find({ userId: profileUser._id, active: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username email profilePicture")
        .lean(),
      Post.countDocuments({ userId: profileUser._id, active: true }),
    ]);

    const normalizedPosts = rawPosts.map((post) => withMediaUrl(req, post));
    const posts = await addLikedState(normalizedPosts, currentUser);

    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await Promise.all([
      Comment.deleteMany({ postId: post._id }),
      Like.deleteMany({ postId: post._id }),
      Post.deleteOne({ _id: post._id }),
    ]);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, postId, commentBody, body } = req.body;
  const targetPostId = post_id || postId;
  const text = (commentBody || body || "").trim();

  try {
    const user = await User.findOne({ token }).select("_id name username profilePicture");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findOne({ _id: targetPostId, active: true }).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      userId: user._id,
      postId: post._id,
      body: text,
    });

    await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name username profilePicture")
      .lean();

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const postId = req.query.post_id || req.query.postId || req.body?.post_id || req.body?.postId;
  const { page, limit, skip } = getPagination(req, 10);

  try {
    const post = await Post.findOne({ _id: postId, active: true }).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ postId: post._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username profilePicture")
        .lean(),
      Comment.countDocuments({ postId: post._id }),
    ]);

    return res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findOne({ _id: comment_id });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const post = await Post.findById(comment.postId).select("userId");
    const isCommentOwner = String(comment.userId) === String(user._id);
    const isPostOwner = post && String(post.userId) === String(user._id);

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "You are not allowed to delete this comment" });
    }

    await Promise.all([
      Comment.deleteOne({ _id: comment_id }),
      Post.updateOne(
        { _id: comment.postId, commentCount: { $gt: 0 } },
        { $inc: { commentCount: -1 } }
      ),
    ]);

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const increment_likes = async (req, res) => {
  const { token, post_id, postId } = req.body;
  const targetPostId = post_id || postId;

  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: targetPostId, active: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({
      userId: user._id,
      postId: post._id,
    });

    const liked = !existingLike;
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
    } else {
      await Like.create({ userId: user._id, postId: post._id });
    }

    const currentCount = post.likeCount ?? post.likes ?? 0;
    const nextCount = Math.max(0, currentCount + (liked ? 1 : -1));
    post.likeCount = nextCount;
    post.likes = nextCount;
    await post.save();

    return res.json({
      message: liked ? "Post liked successfully" : "Post unliked successfully",
      liked,
      likeCount: nextCount,
      likes: nextCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
