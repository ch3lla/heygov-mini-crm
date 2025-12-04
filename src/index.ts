import "dotenv/config";
import express from "express";
import router from "./routes/index.js";
import cors from "cors";
import morgan from "morgan";
import { startReminderJob } from "./jobs/index.js";

const PORT = process.env.PORT || 4000;
export const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [process.env.CLIENT_URL!],
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(morgan("dev")); // route logger

// routes
app.use("/api/v1", router);

app.get("/", (req, res) => {
    res.send("UP");
});

if (process.env.NODE_ENV !== "test"){
    app.listen(PORT, () => {
        console.log(`Server is running on port:${PORT}`);
        // startReminderJob();
    });
}