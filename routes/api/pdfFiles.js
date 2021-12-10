import express from "express";
import fs from "fs";
import multer from "multer";
import cloudinary from "cloudinary";

import auth from "../../middleware/auth.js";
import PDFCard from "../../models/PDFCard.js";
import Hero from "../../models/Hero.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./public/PDF/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
}).single("pdfFile");

// @route   POST api/pdfFiles/
// @desc    Create a PDF File
// @access  Private
router.post("/", auth, (req, res) => {
  try {
    upload(req, res, () => {
      let finalFileName = `./public/PDF/${req.body.newFileName}`;
      fs.rename(
        `./public/PDF/${req.file.originalname}`,
        finalFileName,
        (err) => {
          if (err) console.log("ERROR: " + err);
        }
      );
      let simpleFileName = req.body.newFileName.replace(/\.[^/.]+$/, ""); // Remove extension
      cloudinary.uploader.upload(
        finalFileName,
        (result) => {
          console.log(result);
          res.send("File uploaded");
        },
        { public_id: `frseaura/PDF/${simpleFileName}` }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/pdfFiles/:id
// @desc    Delete a PDF File (Heroku PUT route bug)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let pdfCard = await PDFCard.findById(req.params.id);
    if (!pdfCard) {
      console.log("Carte PDF introuvable... Recherche Hero...");
      pdfCard = await Hero.findById(req.params.id);
      if (!pdfCard) {
        console.log("La carte PDF est introuvable");
        return res.status(404).json({
          errors: [{ msg: "La carte PDF est introuvable" }],
        });
      }
    }
    let simpleFileName = pdfCard.PDF.replace(/\.[^/.]+$/, ""); // Remove extension
    let cloudinaryFile = `frseaura/PDF/${simpleFileName}`;
    cloudinary.v2.uploader.destroy(cloudinaryFile, (error, result) => {
      console.log(result, error);
      console.log(`Fichier "${cloudinaryFile}" supprimé`);
    });
    let herokuFile = `./public/PDF/${pdfCard.PDF}`;
    if (fs.existsSync(herokuFile)) {
      fs.unlinkSync(herokuFile),
        (err) => {
          console.log(err);
        };
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "La carte PDF est introuvable" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/pdfFiles/
// @desc    DELETE all PDF Files
// @access  Private
router.delete("/", auth, async (_, res) => {
  try {
    const folder = "./public/PDF/";
    fs.readdir(folder, (err, files) => {
      if (err) {
        console.log(err);
      } else {
        files.forEach((file) => {
          fs.unlinkSync(folder + file);
          console.log(`Fichier "${file}" supprimé`);
        });
        res.send("Les fichiers ont été supprimés");
      }
    });
  } catch (err) {
    console.erro(err.message);
  }
});

export default router;
