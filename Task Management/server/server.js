const express = require("express");
const cors = require("cors");
const dbConnect = require("./database/db");
require("dotenv").config({ path: "./config/.env" });
const routes = require("./routes/index.routes");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true,
  }
));

app.use("/api/v1", routes);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  dbConnect();
});
