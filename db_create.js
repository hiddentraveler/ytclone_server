import mariadb from "mariadb";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit: 5,
});

async function getData([
  id,
  avatar,
  birthday,
  email,
  firstName,
  lastName,
  sex,
]) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(
      "INSERT INTO user (id, avatar,birthday,email,firstName,lastName,sex) VALUES (?,?,?,?,?,?,?)",
      [id, avatar, birthday, email, firstName, lastName, sex],
    );
    console.log(res);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

function createRandomUser() {
  return [
    faker.string.uuid(),
    faker.image.avatarLegacy(),
    faker.date.birthdate(),
    faker.internet.email(),
    faker.person.firstName(),
    faker.person.lastName(),
    faker.person.sexType(),
  ];
}

// async function generateData(n) {
//   for (let i = 0; i < n; i++) {
//     const user = createRandomUser();
//     console.log(user);
//     await getData(user);
//   }
// }
//
// await generateData(1000);
export async function getUsers() {
  let conn;
  conn = await pool.getConnection();
  const res = await conn.query("SELECT * FROM user");
  return res;
}

export async function setVideo(videoUrl, lessonId) {
  let conn;
  conn = await pool.getConnection();
  const res = await conn.query(
    "INSERT INTO video (vidId, title, descp, channelId, channelName, uploadTime, videoUrl) VALUES (?,?,?,?,?,?,?)",
    [lessonId, , faker.lorem.lines({ min: 1, max: 3 }), , , , videoUrl],
  );
  conn.end();
  return res;
}

export async function addUsers() {
  let conn;
  conn = await pool.getConnection();
  const res = await conn.query("INSERT INTO user ()");
  conn.end();
  return res;
}
