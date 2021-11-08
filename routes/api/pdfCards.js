import express from "express";
import { check, validationResult } from "express-validator";

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
      res.json("Carte PDF ajoutée");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/pdfCards/:id
// @desc    Delete a PDFCard
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const pdfCard = await PDFCard.findById(req.params.id);
    if (!pdfCard) {
      return res.status(404).json({
        errors: [{ msg: "La carte PDF est introuvable" }],
      });
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

export default router;
