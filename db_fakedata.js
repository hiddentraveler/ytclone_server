import mariadb from "mariadb";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { createComment } from "./db_create.js";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit: 5,
});

async function getData() {
  let conn;
  conn = await pool.getConnection();
  const res = await conn.query("SELECT * FROM video");
  conn.end();
  console.log(res);
  return res;
}

async function createComments(res) {
  res.map((vid) => {
    const comment = faker.lorem.lines({ min: 1, max: 2 });
    const commentId = faker.string.uuid();
    createComment(comment, vid.vidId, commentId);
  });
}

for (let i = 0; i < 500; i++) {
  const res = await getData();
  createComments(res);
}
