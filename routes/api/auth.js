import express from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

import auth from "../../middleware/auth.js";
import User from "../../models/User.js";

const router = express.Router();

// @route  GET api/auth
// @desc   Load User
// @access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post(
  "/",
  [
    check("mail", "Merci d'entrer une adresse mail valide").isEmail(),
    check("password", "Veuillez entrer votre mot de passe")
      .not()
      .isEmpty()
      .exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mail, password } = req.body;
    try {
      let user = await User.findOne({ mail });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "L'adresse mail ou le mot de passe est incorrect" }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "L'adresse mail ou le mot de passe est incorrect" }],
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

export default router;
