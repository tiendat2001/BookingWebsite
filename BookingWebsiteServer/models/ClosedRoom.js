import mongoose from "mongoose";
const { Schema } = mongoose;
const ClosedRoomSchema = new mongoose.Schema({
    // Phải thêm vào ID ownder
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    roomTypeId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    quantityRoomClosed: {
        type: Number,
        required: true
    },
    startClose: {
        type: Date,
        require: true,
    },
    endClose: {
        type: Date,
        require: true,
    },
    allDatesClosed: {
        type: [Date],
        require: true,
    },


},
    { timestamps: true }
);

export default mongoose.model("ClosedRoom", ClosedRoomSchema)