import "dotenv/config";
import express from "express";
import router from "./routes/index.ts";
import cors from "cors";
import morgan from "morgan";

const PORT = process.env.PORT || 4000;
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: "*"
}))
app.use(morgan("dev")); // route logger

// routes
app.use("/api/v1", router);

app.get("/", (req, res) => {
    res.send("UP");
})

app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
})