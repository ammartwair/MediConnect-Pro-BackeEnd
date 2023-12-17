import connectDB from "../../DB/connection.js";
import { globalErrorHandler } from '../middleware/errorHandling.js';
import authRouter from './Auth/auth.router.js';

const initApp = (app, express) => {
    app.use(express.json());
    connectDB();
    app.get('/', (req, res) => {
        return res.status(200).json("Welcome to Our Medical Clinic ^_^");
    })
    app.use('/auth', authRouter);
    app.get("*", (req, res) => {
        return res.status(500).json({ message: "Page Not Found!!" });
    });
    app.use(globalErrorHandler);
}

export default initApp;