import { connect } from 'mongoose';

const connectDB = async () => {
    return await connect("mongodb://localhost:27017/medicalClinic")
        .then(() => {
            console.log("Connecting to Database");
        })
        .catch((err)=>{
            console.log(`Error connecting to Database, ${err}`);
        });
}

export default connectDB;