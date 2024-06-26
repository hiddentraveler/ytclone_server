import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit: 5,
});

const statement = `CREATE TABLE users(
  avatar varchar(255),
  email varchar(255) PRIMARY KEY NOT NULL,
  pass varchar(255) not null,
  username varchar(255),
  id varchar(255) PRIMARY KEY NOT NULL,
);

CREATE TABLE comments(
  comment varchar(500),
  vidId varchar(20),
  commentId varchar(255) PRIMARY KEY NOT NULL,
);

`;

async function genData() {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(statement);
    console.log(res);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

genData();
