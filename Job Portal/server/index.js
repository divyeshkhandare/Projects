const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/db");
const routes = require("./routes/index.routes");
const decodeToken = require("./middleware/decodeToken");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", decodeToken, routes);
app.get("/", (req, res) => {
  res.send("Welcome to the Job Portal API");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening on port : " + port);
  dbConnect();
});
