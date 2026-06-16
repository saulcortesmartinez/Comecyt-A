import express from "express";
import { getModulos } from "../controllers/modulosController.js";

const router = express.Router();

router.get("/", getModulos);

export default router;
