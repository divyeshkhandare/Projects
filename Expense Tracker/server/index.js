const express = require("express");
const db = require("./config/db");
const { createUser } = require("./controller/user.controller");
const app = express();

app.use(express.json());

(async () => {
  try {
    await db.authenticate();
    console.log("Database connected");
    await db.sync();
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
})();

app.post("/", createUser);

app.listen(8090, () => {
  console.log("Server running on port 3000");
});
