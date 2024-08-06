import mongoose from 'mongoose';
const { Schema } = mongoose;

const RoomTypeSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    hotelId:{
        type: Schema.Types.ObjectId,
        required:true
    },
 
    price:{
        type: Number,
        required:true
    },
    photos: {
        type: [String],
      },
    maxPeople:{
        type: Number, // 2 tre em = 1 ng lon
        required:true
    },
    desc:{
        type: String,
        required:true
    },
    status:{
        type: Boolean,
        default:true
    },

    roomNumbers:[
        {   
            // number:Number, 
            unavailableDates:{type:[Date]},
            // status:{type: Boolean, default:true},
            // unavailableRangeDates:
            // [
            //     {
            //         startDateRange: {type:Date},
            //         endDateRange: {type:Date}
            //     }
            // ]
        }
                ], 
},
{ timestamps : true }
);

export default mongoose.model("RoomType", RoomTypeSchema)