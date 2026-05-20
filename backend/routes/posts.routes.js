import { Router } from 'express'
import { activeCheck, createPost, getAllPosts, getPostsByUser, deletePost, commentPost, get_comments_by_post, delete_comment_of_user, increment_likes } from '../controllers/posts.controller.js';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';


const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const safeBaseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .slice(0, 80);
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeBaseName}${extension}`)
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});


router.route('/').get(activeCheck);

router.route("/post").post(upload.single('media'), createPost)
router.route("/posts").get(getAllPosts);
router.route("/posts/user/:username").get(getPostsByUser);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comments").delete(delete_comment_of_user);
router.route("/increment_post_like").post(increment_likes);







export default router;
