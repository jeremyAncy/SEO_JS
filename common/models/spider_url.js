import mongoose, {Schema} from "mongoose";

let schema = new Schema({
    link      : String,
    last_crawl: {type: Date, default: 0},
    priority  : {type: Number, default: 1},
    domain    : String
});

export default mongoose.model("spider_url", schema);