const express = require("express");
const connectDB = require("./database/db");
const router = require("./routes/index.routes");
require("dotenv").config({ path: "./config/.env" });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api/v1", router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
