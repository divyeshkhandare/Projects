import express from "express";
import dbConnect from "./config/db.js";
import router from "./routes/url.js";
import URL from "./models/url.model.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/url", router);

app.get("/:shortURL", async (req, res) => {
  const { shortURL } = req.params;
  try {
    if (!shortURL) {
      return res.status(400).json({ message: "Missing short URL" });
    } else {
      const Visits = await URL.findOne({ shortURL });
      Visits.visitHistory.push({ timestamp: Date.now() });
      await Visits.save();
      res.redirect(Visits.originalURL);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(8090, () => {
  console.log("Server running on port 8090");
  dbConnect();
});
