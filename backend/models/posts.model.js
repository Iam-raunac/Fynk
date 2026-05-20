import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        index: true,
    },
    body: {
        type: String,
        default: "",
        trim: true,

    }, 
    likes: {
        type: Number,
        default: 0,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },

    UpdatedAt:{
        type: Date,
        default: Date.now,
    },
    media: {
        type: String,
        default: "",
    },
    mediaUrl: {
        type: String,
        default: "",
    },
    mediaPublicId: {
        type: String,
        default: "",
    },
    storageProvider: {
        type: String,
        enum: ["local", "cloudinary"],
        default: "local",
    },
    active: {
        type: Boolean,
        default: true,

    },
    fileType: {
        type: String,
        default: "",
    }

});

postSchema.index({ active: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
