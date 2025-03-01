import express from "express";
import {
  generateUrl,
  getAnalytics,
  getUrlPage,
} from "../controller/url.controller.js";
const router = express.Router();

router.get("/", getUrlPage);

router.post("/", generateUrl);

router.get("/analytics/:shortURL", getAnalytics);

export default router;
