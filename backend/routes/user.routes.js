import { Router } from 'express'
import { register , login, uploadProfilePicture,updateUserProfile, getUserAndProfile, getProfileByUsername, updateProfileData,getAllUserProfiles, dowloadProfile,sendConnectionRequest,getMyConnectionsRequest,whatAreMyConnections,getAcceptedConnections,acceptConnectionRequest} from '../controllers/user.controller.js';  // <- focus on this line
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const router = Router();

// use multer for later updates in profile

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 80);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeBaseName}${extension}`);
  }
});



const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture);


router.route('/register').post(register);
router.route('/login').post(login);
router.route("/user_update").post(updateUserProfile)
router.route("/get_user_and_profile").get(getUserAndProfile)
router.route("/profile/:username").get(getProfileByUsername)
router.route("/update_profile_data").post(updateProfileData)
router.route("/users/get_all_users").get(getAllUserProfiles);
router.route("/user/download_resume").get(dowloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequest").get(getMyConnectionsRequest);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/connections").get(getAcceptedConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);



export default router;

// user routes ke andr ek login register,get user profile resume dowload features
