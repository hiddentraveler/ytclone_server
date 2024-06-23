import express from "express";
import cors from "cors";
import multer from "multer";
import { faker } from "@faker-js/faker";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import {
  addUsers,
  createComment,
  getComments,
  getUsers,
  home,
  setVideo,
} from "./db_create.js";

const port = 8000;

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        faker.string.nanoid(10) +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // watch it
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", async function (req, res) {
  const result = await home();
  res.json(result);
});

app.post("/comments", async function (req, res) {
  const vidId = req.body.vidId;
  const result = await getComments(vidId);
  res.json(result);
});

app.patch("/comments", async function (req, res) {
  const vidId = req.body.vidId;
  const comment = req.body.comment;
  const commentId = faker.string.uuid();
  const result = await createComment(comment, vidId, commentId);
  res.json(result);
});
// get all users
// app.get("/users", async function (req, res) {
//   const result = await getUsers();
//   res.json(result);
// });

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const pass = req.body.pass;
  console.log(email, pass);
  const result = await addUsers(email, pass);
  switch (result) {
    case 0:
      res.json({ msg: "user created", error: 0 });
      break;
    case 1062:
      res.json({ msg: "This email already exists.", error: 1 });
      break;
    case 1048:
      res.json({ msg: "Email field is empty", error: 1 });
      break;
    case "error in inserting the data":
      res.json({ msg: "error in inserting the data", error: 1 });
  }
});

app.post("/login", async function (req, res) {
  const email = req.body.email;
  const pass = req.body.pass;
  if (!email) {
    res.json({ msg: "email field is empty ", error: 1 });
    return 0;
  }
  if (!pass) {
    res.json({ msg: "password field is empty ", error: 1 });
    return 0;
  }

  const result = await getUsers(email, pass);
  res.json(result);
});

app.post("/upload", upload.single("file"), function (req, res) {
  const lessonId = faker.string.nanoid(10);
  const videoPath = req.file.path;
  const outputPath = `./uploads/courses/${lessonId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  console.log("hlsPath", hlsPath);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath} && ffmpeg -i ${videoPath} -ss 00:00:00 -frames:v 1 "${outputPath}/thumbnail.jpg"

`;

  exec(ffmpegCommand, () => {
    const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;
    const thumbnail = `http://localhost:8000/uploads/courses/${lessonId}/thumbnail.jpg`;
    const uploadTime = new Date();
    const title = req.body.title;
    const username = req.body.username;
    const userid = req.body.userid;
    const descp = faker.lorem.lines(1);
    const vidId = lessonId;
    const result = setVideo(
      videoUrl,
      vidId,
      title,
      descp,
      userid,
      username,
      uploadTime,
      thumbnail,
    );
    res.json(result);
  });
});

app.listen(port, function () {
  console.log(`server is listening at port ${port}...`);
});
