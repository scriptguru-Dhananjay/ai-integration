import mongoose from "mongoose";


const ticketSchema = new mongoose.Schema({
    company : {
        type:String,
        default:null
    },
    person:{
        type:String,
        default:null  
    },

    product : {
        type:String,
        required:true
    },
    issue: {
        type:String,
        required:true
    },
    category:{
        type: String,
        enum:["bug", "feature", "question"],
        required:true
    },
    summary : {
        type:String,
        required:true
    },
    rawText: {
        type:String,
        required:true
    },
    tokens:{
        prompt:Number,
        completion:Number,
        total:Number
    },
    createdAt:{
        type: Date,
        default:Date.now,
    },
});

export default mongoose.model("Ticket", ticketSchema);