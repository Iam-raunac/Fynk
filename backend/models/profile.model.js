import mongoose from "mongoose";


const educationSchema = new mongoose.Schema({
    school:{
        type: String,
        default:' ',

    },
    degree:{
        type: String,
        default:' ',
    },
    fieldOfStudy:{
        type: String,
        default:' ',
    },
});

const workingSchema = new mongoose.Schema({
    company:{
        type: String,
        default:' ',

    },
    position:{
        type: String,
        default:' ',
    },
    postion:{
        type: String,
        default:' ',
    },
    years:{
        type: String,
        default:' ',
    },
});

// profile schema 
const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        unique: true,
    },
    bio: {
        type: String,
        default: '',
    },
    currentPost: {
        type: String,
        default: '',
    },

    pastWork:{
       type: [workingSchema],
       default: [],
    },
    education:{
        type:  [educationSchema],
        default: [],
    }

});

profileSchema.index({ currentPost: 1 });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
