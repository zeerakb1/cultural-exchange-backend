const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const cookieParser = require("cookie-parser");
const path = require("path");
// import { fileURLToPath } from "url";

dotenv.config();


// Middlewares
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(cors({ origin: "https://cultural-exchange-app.onrender.com", credentials: true }));
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database is connected successfully!");
  } catch (err) {
    console.log(err);
  }
};

//image upload
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "images");
  },
  filename: (req, file, fn) => {
    fn(null, req.body.img);
    // fn(null,"image1.jpg")
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  // console.log(req.body)
  res.status(200).json("Image has been uploaded successfully!");
});

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`App is running on port ${process.env.PORT}`);
});
