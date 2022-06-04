import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dropTable = (table) =>
  open({
    filename: "assets/data.db",
    driver: sqlite3.Database,
  })
    .then((db) => db.exec(`DROP TABLE table`))
    .then((res) => console.log(res));

export const updatePostedRedditStatus = (id, dateAdded) =>
  open({
    filename: "assets/data.db",
    driver: sqlite3.Database,
  })
    .then(async (db) => {
      const res = await db.exec(
        "CREATE TABLE IF NOT EXISTS posted_reddit_ids (ID TEXT PRIMARY KEY, DATE_ADDED TEXT)"
      );
      return db;
    })
    .then(
      async (db) =>
        await db.run(
          "INSERT INTO posted_reddit_ids (ID, DATE_ADDED) VALUES (?, ?)",
          id,
          dateAdded
        )
    );

export const getAll = (table) =>
  open({
    filename: "assets/data.db",
    driver: sqlite3.Database,
  })
    .then((db) => db.all(`SELECT * FROM ${table}`))
    .then((res) => console.log(res));

(async () => await getPostedRedditPosts())();
//(async () => await updatePostedRedditStatus("test2", "2022-06-04"))();
