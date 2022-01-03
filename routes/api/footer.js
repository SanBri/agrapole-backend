import express from "express";
import { check, validationResult } from "express-validator";

import auth from "../../middleware/auth.js";
import Footer from "../../models/Footer.js";

const router = express.Router();

// @route   GET api/footer/
// @desc    Get Footer
// @access  Public
router.get("/", async (_, res) => {
  try {
    const footer = await Footer.findOne().where({ name: "footer" });
    if (!footer) {
      res.status(404).send("Pied de Page introuvable");
    }
    res.status(200).send(footer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/footer/
// @desc    Edit Footer
// @access  Private
router.put(
  "/",
  [
    auth,
    [
      check("content", "Veuillez rédiger le contenu du Pied de Page")
        .not()
        .isEmpty(),
      check("mail", "Veuillez indiquer une adresse e-mail de contact")
        .not()
        .isEmpty(),
      check("mail", "L'adresse e-mail est trop longue").isLength({
        max: 254,
      }),
      check("mail").custom(async (value) => {
        let mailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!mailCheck) {
          throw new Error(`Veuillez entrer une adresse e-mail valide`);
        }
      }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, mail } = req.body;
    const footerFields = {};
    footerFields.content = content;
    footerFields.mail = mail;
    if (content) footerFields.content = content;
    if (mail) footerFields.mail = mail;
    try {
      const footer = await Footer.findOneAndUpdate(
        { name: "footer" },
        { $set: footerFields },
        { new: true }
      );
      if (!footer) {
        return res.status(404).json({
          errors: [{ msg: "Pied de Page introuvable" }],
        });
      }
      await footer.save();
      res.json(footer);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Pied de Page introuvable" });
      }
      res.status(500).send("Server Error");
    }
  }
);

export default router;
