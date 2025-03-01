import { nanoid } from "nanoid";
import URL from "../models/url.model.js";

export const generateUrl = async (req, res) => {
  const { originalURL } = req.body;
  try {
    if (!originalURL) {
      return res.status(400).send("Please provide an original URL");
    } else {
      let existingUrl = await URL.findOne({ originalURL });
      if (existingUrl) {
        return res.render("url", { Visits: existingUrl });
      }
      const shortID = nanoid(8);
      const Url = await URL.create({
        originalURL,
        shortURL: shortID,
      });
      res.render("url", { Visits: Url });
    }
  } catch (error) {
    console.error("Error generating short URL:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const getAnalytics = async (req, res) => {
  const { shortURL } = req.params;
  try {
    const result = await URL.findOne({ shortURL });
    if (!result) {
      return res.status(404).send("Short URL not found");
    } else {
      res.render("analytics", {
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
      });
    }
  } catch (error) {
    console.error("Error fetching analytics:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const getUrlPage = async (req, res) => {

  res.render("url", { Visits : { shortURL: null }});
};
