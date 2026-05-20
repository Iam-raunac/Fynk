import mongoose from "mongoose";


const connectionRequest = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index: true,
    },
    connectionId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index: true,
    },
    status_accepted: {
        type: Boolean,
        default: null,
    }


}, { timestamps: true });

connectionRequest.index({ userId: 1, connectionId: 1 }, { unique: true });
connectionRequest.index({ connectionId: 1, status_accepted: 1 });
connectionRequest.index({ userId: 1, status_accepted: 1 });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequest);

export default  ConnectionRequest;
