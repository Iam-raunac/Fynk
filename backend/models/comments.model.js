import mongoose from "mongoose";


const CommentSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index: true,
    },
    postId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required: true,
        index: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    }


}, { timestamps: true });

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
