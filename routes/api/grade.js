import express from "express";
import { check, validationResult } from "express-validator";

import auth from "../../middleware/auth.js";
import Grade from "../../models/Grade.js";

const router = express.Router();

// @route   GET api/grade/
// @desc    Get Grade
// @access  Public
router.get("/", async (_, res) => {
  try {
    const grade = await Grade.findOne().where({ name: "grade" });
    if (!grade) {
      res.status(404).send("Moyenne introuvable");
    }
    res.status(200).send(grade);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/grade/
// @desc    Edit grade
// @access  Private
router.put(
  "/",
  [
    auth,
    [
      check("title", "Veuillez rédiger un titre").not().isEmpty(),
      check("average", "Veuillez indiquer une moyenne")
        .not()
        .isEmpty()
        .custom(async (value, { req }) => {
          if (typeof value != "number") {
            throw new Error(`La moyenne doit être un nombre`);
          }
          if (value > req.body.scale) {
            throw new Error(
              `La moyenne ne peut pas être supérieure au barème établi`
            );
          }
          if (value < 0) {
            throw new Error(`La moyenne ne peut pas être inférieure à 0`);
          }
        }),
      check(
        "scale",
        "Veuillez indiquer le barème indiquant sur combien est notée la moyenne"
      )
        .not()
        .isEmpty()
        .custom(async (value) => {
          if (typeof value != "number") {
            throw new Error(`Le barème doit être un nombre`);
          }
          if (value < 5) {
            throw new Error(`Le barème ne peut pas être inférieur à 5`);
          }
        }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, average, scale } = req.body;
    const gradeFields = {};
    gradeFields.title = title;
    gradeFields.average = average;
    gradeFields.scale = scale;
    if (title) gradeFields.title = title;
    if (average) gradeFields.average = average;
    if (scale) gradeFields.scale = scale;
    try {
      const grade = await Grade.findOneAndUpdate(
        { name: "grade" },
        { $set: gradeFields },
        { new: true }
      );
      if (!grade) {
        return res.status(404).json({
          errors: [{ msg: "Moyenne introuvable" }],
        });
      }
      await grade.save();
      res.json(grade);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Moyenne introuvable" });
      }
      res.status(500).send("Server Error");
    }
  }
);

export default router;
