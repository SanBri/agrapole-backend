import express from "express";
import fs from "fs";
import multer from "multer";
import cloudinary from "cloudinary";

import auth from "../../middleware/auth.js";
import PDFCard from "../../models/PDFCard.js";
import Hero from "../../models/Hero.js";

const router = express.Router();

// @route   GET api/pdfFiles/:PDF
// @desc    Get a PDF File
// @access  Public
router.get("/:PDF", async (req, res) => {
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
      cloudinary.uploader.upload(
        finalFileName,
        (result) => {
          console.log(result);
          console.log(`${req.body.newFileName} créé`);
          res.send("File uploaded");
        },
        { public_id: `frseaura/PDF/${req.body.newFileName}` }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/pdfFiles/:id
// @desc    Replace a PDF File
// @access  Private
// router.put("/:id", auth, async (req, res) => {
//   try {
//     upload(req, res, () => {
//       let finalFileName = `./public/PDF/${req.body.newFileName}`;
//       fs.rename(
//         `./public/PDF/${req.file.originalname}`,
//         finalFileName,
//         (err) => {
//           if (err) console.log("ERROR: " + err);
//         }
//       );
//       console.log("Fichier créé");
//     });
// const oldFile = await PDFCard.findById(req.params.id).select("PDF -_id");
//   console.log(oldFile.PDF);
//   if (!oldFile) {
//     console.log("Carte PDF introuvable");
//     return res.status(404).json({ msg: "Carte PDF introuvable" });
//   }
//   let filePath = `./public/PDF/${oldFile.PDF}`;
//   if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath),
//       (err) => {
//         console.log(err);
//       };
//     res.send("Fichier supprimé");
//   } else {
//     console.error("Fichier introuvable");
//     res.send("Fichier introuvable");
//   }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// @route   DELETE api/pdfFiles/:id
// @desc    Delete a PDF File (Heroku PUT route bug)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Recherche de la carte PDF...");
    let pdfCard = await PDFCard.findById(req.params.id);
    if (!pdfCard) {
      console.log("Carte PDF introuvable... Recherche Hero...");
      pdfCard = await Hero.findById(req.params.id);
      console.log(`Nom du fichier PDF du Hero trouvé :`, pdfCard.PDF);
      if (!pdfCard) {
        console.log("La carte PDF est introuvable");
        return res.status(404).json({
          errors: [{ msg: "La carte PDF est introuvable" }],
        });
      }
    }
    console.log(`Recherche du fichier "${pdfCard.PDF}"`);
    let file = `frseaura/PDF/${pdfCard.PDF}`;
    cloudinary.uploader.destroy(file, function (result) {
      console.log(result);
      console.log("OK");
    });
    if (fs.existsSync(file)) {
      console.log(`${file} trouvé`);
      fs.unlinkSync(file),
        (err) => {
          console.log(err);
        };
      console.log(`Fichier "${pdfCard.PDF}" supprimé `);
      res.send(`Le fichier "${pdfCard.PDF}" a bien été supprimé`);
    } else {
      console.log("Fichier introuvable");
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
