import mongoose, {Schema} from "mongoose";

let schema = new Schema({
    link                : String,
    html                : String,
    redirects           : [
        {
            link         : String,
            http_code    : Number,
            http_message : String,
            response_time: Number
        }
    ],
    time_used           : Number,
    response_time       : String,
    cookies             : [
        String
    ],
    headers             : {},
    http_code           : Number,
    http_message        : String,
    crawl_date          : {type: Date, default: Date.now},
    final_link          : String,
    ms_meta             : {type: Boolean, default: false},
    ms_titles           : {type: Boolean, default: false},
    ms_pictures         : {type: Boolean, default: false},
    ms_duplicate_content: {type: Boolean, default: false},
    ms_scripts          : {type: Boolean, default: false},
    ms_social           : {type: Boolean, default: false},
    ms_delays           : {type: Boolean, default: false},
    ms_backlinks        : {type: Boolean, default: false},
    ms_ranking          : {type: Boolean, default: false},
    ms_semantic         : {type: Boolean, default: false},
    ms_push_to_rabbit   : {type: Boolean, default: false}
});

export default mongoose.model("spider_result", schema);
