import express from "express";
import { check, validationResult } from "express-validator";

import auth from "../../middleware/auth.js";
import Partner from "../../models/Partner.js";

const router = express.Router();

// @route   GET api/partners/
// @desc    Get All Partners
// @access  Public
router.get("/", async (_, res) => {
  try {
    const partners = await Partner.find();
    if (!partners) {
      res.status(404).send("Il n'y a aucun partenaire");
    }
    res.status(200).send(partners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/partners/
// @desc    Add a Partner
// @access  Private
router.post(
  "/",
  [auth, [check("name", "Veuillez donner un nom").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, image, url } = req.body;
    const partnersFields = {};
    partnersFields.name = name;
    partnersFields.image = image;
    partnersFields.url = url;
    if (name) partnersFields.name = name;
    if (image) partnersFields.image = image;
    if (url) partnersFields.url = url;
    try {
      const newPartner = new Partner(partnersFields);
      await newPartner.save();
      res.json(newPartner);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

export default router;
