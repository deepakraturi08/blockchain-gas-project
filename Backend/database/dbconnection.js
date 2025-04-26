import mongoose from "mongoose";

export const dbconnect=async()=>{
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
        .then(() => console.log("Mongodb started")) 
        .catch((err) => console.log(err))

}

