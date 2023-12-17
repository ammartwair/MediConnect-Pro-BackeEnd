import { connect } from 'mongoose';

const connectDB = async () => {
    return await connect(process.env.DB_LOCAL)
        .then(() => {
            console.log("Connecting to Database ^_^");
        })
        .catch((err)=>{
            console.log(`Error connecting to Database, ${err}`);
        });
}

export default connectDB;