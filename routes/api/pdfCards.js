import express from "express";
import { check, validationResult } from "express-validator";
import fs from "fs";
import multer from "multer";

import auth from "../../middleware/auth.js";
import PDFCard from "../../models/PDFCard.js";

const router = express.Router();

// @route   POST api/pdfCards/
// @desc    Add a PDFCard
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("title", "Veuillez donner un titre").not().isEmpty(),
      check("PDF", "Veuillez importer un fichier PDF").not().isEmpty(),
      check("block", "Veuillez choisir une fenêtre où la carte apparaîtra")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, PDF, block } = req.body;
    const pdfCardsFields = {};
    pdfCardsFields.title = title;
    pdfCardsFields.PDF = PDF;
    pdfCardsFields.block = block;
    if (title) pdfCardsFields.title = title;
    if (PDF) pdfCardsFields.PDF = PDF;
    if (block) pdfCardsFields.block = block;
    try {
      const newPDFCard = new PDFCard(pdfCardsFields);
      await newPDFCard.save();
      res.json(newPDFCard);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/pdfCards/
// @desc    Get All pdfCards
// @access  Public
router.get("/", async (_, res) => {
  try {
    const pdfCards = await PDFCard.find();
    if (!pdfCards) {
      return res.status(404).send("Aucune carte PDF");
    }
    res.status(200).send(pdfCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/pdfCards/:block
// @desc    Get pdfCards of a block
// @access  Public
router.get("/:block", async (req, res) => {
  try {
    const pdfCards = await PDFCard.find().where({ block: req.params.block });
    if (!pdfCards) {
      return res.status(404).send("Aucune carte PDF");
    }
    res.status(200).send(pdfCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/pdfCards/pdfCard/:id
// @desc    Get a pdfCard by ID
// @access  Public
router.get("/pdfCard/:id", async (req, res) => {
  try {
    const pdfCard = await PDFCard.findById(req.params.id);
    if (!pdfCard) {
      return res.status(404).json({ msg: "Carte PDF introuvable" });
    }
    res.json(pdfCard);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Carte PDF introuvable" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/pdfCards/:id
// @desc    Edit a PDFCard
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      check("title", "Veuillez donner un titre").not().isEmpty(),
      check("PDF", "Veuillez importer un fichier PDF").not().isEmpty(),
      check("block", "Veuillez choisir une fenêtre où la carte apparaîtra")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, PDF, block } = req.body;
    const pdfCardsFields = {};
    pdfCardsFields.title = title;
    pdfCardsFields.PDF = PDF;
    pdfCardsFields.block = block;
    if (title) pdfCardsFields.title = title;
    if (PDF) pdfCardsFields.PDF = PDF;
    if (block) pdfCardsFields.block = block;

    try {
      const pdfCard = await PDFCard.findOneAndUpdate(
        { _id: req.params.id },
        { $set: pdfCardsFields },
        { new: true }
      );
      if (!pdfCard) {
        return res.status(404).json({
          errors: [{ msg: "Carte PDF introuvable" }],
        });
      }
      await pdfCard.save();
      res.json({ msg: "Les modifications ont bien été enregistrées" });
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Carte PDF introuvable" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/pdfsCards/pdfFile/:PDF
// @desc    Get a PDF File
// @access  Public
router.get("/pdfFile/:PDF", async (req, res) => {
  try {
    var data = fs.readFileSync(`./public/PDF/${req.params.PDF}`);
    res.contentType("application/pdf");
    res.send(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

const storage = multer.diskStorage({
  destination: "./public/PDF/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("pdfFile");

// @route   POST api/pdfsCards/pdfFile/
// @desc    Create a PDF File
// @access  Private
router.post("/pdfFile/", auth, (req, res) => {
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
      res.send("File uploaded");
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/pdfsCards/pdfFile/:id
// @desc    Replace a PDF File
// @access  Private
router.put("/pdfFile/:id", auth, async (req, res) => {
  try {
    const oldFile = await PDFCard.findById(req.params.id).select("PDF -_id");
    console.log(oldFile.PDF);
    if (!oldFile) {
      console.log("Carte PDF introuvable");
      return res.status(404).json({ msg: "Carte PDF introuvable" });
    }
    let filePath = `./public/PDF/${oldFile.PDF}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath),
        (err) => {
          console.log(err);
        };
      res.send("Fichier supprimé");
    } else {
      console.error("Fichier introuvable");
      res.send("Fichier introuvable");
    }
    upload(req, res, () => {
      let finalFileName = `./public/PDF/${req.body.newFileName}`;
      fs.rename(
        `./public/PDF/${req.file.originalname}`,
        finalFileName,
        (err) => {
          if (err) console.log("ERROR: " + err);
        }
      );
      console.log("Fichier créé");
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/pdfCards/:id
// @desc    Delete a PDFCard & its PDF File
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const pdfCard = await PDFCard.findById(req.params.id);
    if (!pdfCard) {
      return res.status(404).json({
        errors: [{ msg: "La carte PDF est introuvable" }],
      });
    }
    let file = `./public/PDF/${pdfCard.PDF}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file),
        (err) => {
          console.log(err);
        };
    } else {
      console.log("Fichier introuvable");
    }
    await pdfCard.remove();
    res.json("Carte PDF supprimée");
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "La carte PDF est introuvable" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/pdfsCards/allPdfFile
// @desc    Get a PDF File
// @access  Public
router.get("/allPdfFile"),
  async (req, res) => {
    try {
      const pdfFiles = [];
      const folder = "./public/PDF/";
      fs.readdir(folder, (err, files) => {
        files.forEach((file) => {
          console.log(file);
          pdfFiles.push(file);
        });
        (err) => {
          if (err) console.log("ERROR: " + err);
        };
      });
      res.json(pdfFiles);
    } catch (err) {
      console.erro(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Les Fichiers sont introuvables" });
      }
    }
  };

export default router;
