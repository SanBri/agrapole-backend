import express from "express";
import { check, validationResult } from "express-validator";
import fs from "fs";
import multer from "multer";
import cloudinary from "cloudinary";

import path from "path";

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

// @route   DELETE api/partners/
// @desc    Delete a Partner
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        errors: [{ msg: "Le partenaire est introuvable" }],
      });
    }
    let simpleFileName = req.body.newFileName.replace(/\.[^/.]+$/, ""); // Remove extension
    let cloudinaryFile = `frseaura/partners/${simpleFileName}`;
    cloudinary.v2.uploader.destroy(cloudinaryFile, (error, result) => {
      console.log(result, error);
      console.log(`Fichier "${cloudinaryFile}" supprimé`);
    });
    let herokuFile = `./public/partners/${partner.image}`;
    if (fs.existsSync(herokuFile)) {
      fs.unlinkSync(herokuFile),
        (err) => {
          console.log(err);
        };
    }
    await partner.remove();
    res.json("Partenaire supprimé");
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Le partenaire est est introuvable" });
    }
    res.status(500).send("Server Error");
  }
});
export default router;

const storage = multer.diskStorage({
  destination: "./public/partners/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("logoFile");

// @route   POST api/partners/logoFile/
// @desc    Create a logo file
// @access  Private
router.post("/logoFile/", auth, (req, res) => {
  try {
    upload(req, res, () => {
      let finalFileName = `./public/partners/${req.body.newFileName}`;
      fs.rename(
        `./public/partners/${req.file.originalname}`,
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
        { public_id: `frseaura/partners/${simpleFileName}` }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/partners/logoFile/:logo
// @desc    Get a logo file
// @access  Public
router.get("/logoFile/:logo", (req, res) => {
  try {
    var data = fs.readFileSync(`./public/partners/${req.params.logo}`);
    if (path.extname(req.params.logo) == "jpg" || "jpeg") {
      res.contentType("image/jpeg");
    } else if (path.extname(req.params.logo) == "png") {
      res.contentType("image/png");
    }
    res.send(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
