import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const conn = await mongoose.connect("mongodb://tgadmin:admin12345@test.cluster-c1anzsaz4wbx.ap-south-1.docdb.amazonaws.com:27017/tgtestdb", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false 
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export default connectDb