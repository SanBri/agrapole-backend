import express from "express";
import { check, validationResult } from "express-validator";

import auth from "../../middleware/auth.js";
import Hero from "../../models/Hero.js";

const router = express.Router();

// @route   POST api/hero/
// @desc    Add a Hero
// @access  Private
// router.post(
//   "/",
//   [
//     auth,
//     [
//       check("title", "Veuillez rédiger un titre").not().isEmpty(),
//       check("catchphrase", "Veuillez rédiger un sous-titre").not().isEmpty(),
//       check("description", "Veuillez rédiger une description").not().isEmpty(),
//       check(
//         "description",
//         "La description est trop longue (830 caractères maximums)"
//       ).isLength({
//         max: 830,
//       }),
//     ],
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const { title, catchphrase, description } = req.body;
//     const heroFields = {};
//     heroFields.title = title;
//     heroFields.catchphrase = catchphrase;
//     heroFields.description = description;
//     if (title) heroFields.title = title;
//     if (catchphrase) heroFields.catchphrase = catchphrase;
//     if (description) heroFields.description = description;
//     try {
//       const newHero = new Hero(heroFields);
//       await newHero.save();
//       res.json(newHero);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

// @route   GET api/catchphraseCards/:description
// @desc    Get catchphraseCards of a description
// @access  Public
router.get("/:description", async (req, res) => {
  try {
    const catchphraseCards = await catchphraseCard
      .find()
      .where({ description: req.params.description });
    if (!catchphraseCards) {
      res.status(404).send("Aucune carte catchphrase");
    }
    res.status(200).send(catchphraseCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/hero/
// @desc    Edit hero
// @access  Private
router.put(
  "/",
  [
    auth,
    [
      check("title", "Veuillez rédiger un titre").not().isEmpty(),
      check("catchphrase", "Veuillez rédiger un sous-titre").not().isEmpty(),
      check("description", "Veuillez rédiger une description").not().isEmpty(),
      check(
        "description",
        "La description est trop longue (830 caractères maximum)"
      ).isLength({
        max: 830,
      }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, catchprase, description } = req.body;
    const heroFields = {};
    heroFields.title = title;
    heroFields.catchprase = catchprase;
    heroFields.description = description;
    if (title) heroFields.title = title;
    if (catchprase) heroFields.catchprase = catchprase;
    if (description) heroFields.description = description;

    try {
      const hero = await Hero.findOneAndUpdate(
        { name: "hero" },
        { $set: heroFields },
        { new: true }
      );
      if (!hero) {
        return res.status(404).json({
          errors: [{ msg: "Impossible de trouver le hero" }],
        });
      }
      await hero.save();
      res.json(hero);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Impossible de trouver le hero" });
      }
      res.status(500).send("Server Error");
    }
  }
);

export default router;
