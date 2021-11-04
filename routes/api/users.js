import express from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

import auth from "../../middleware/auth.js";
import User from "../../models/User.js";

const router = express.Router();

// @route  POST api/users
// @desc   Register user
// @access Pubic
// router.post(
//   "/",
//   [
//     check("name", "Veuillez entrer un nom").not().isEmpty(),
//     check("mail", "Merci d'entrer une adresse mail valide").isEmail(),
//     check(
//       "password",
//       "Le mot de passe doit contenir au moins 8 caractères"
//     ).isLength({ min: 8 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, mail, password } = req.body;
//     try {
//       let user = await User.findOne({ mail });
//       if (user) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "Cette adresse mail est déjà utilisée" }] });
//       }

//       // Create new object
//       user = new User({
//         name,
//         mail,
//         password,
//       });

//       // Password Crypt
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);

//       await user.save();
//       const payload = {
//         user: {
//           id: user.id,
//         },
//       };

//       jwt.sign(
//         payload,
//         config.get("jwtSecret"),
//         { expiresIn: 36000 },
//         (err, token) => {
//           if (err) throw err;
//           res.json({ token });
//         }
//       );
//     } catch (err) {
//       console.log(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// @route   PUT api/users/settings/:id
// @desc    Change password & email
// @access  Private
router.put(
  "/settings/:id",
  [
    auth,
    [
      check("mail", "Merci d'entrer une adresse mail valide").isEmail(),
      check("oldPassword", "Veuillez entrer votre mot de passe").exists(),
      check(
        "newPassword",
        "Le mot de passe doit contenir au moins 8 caractères"
      ).isLength({ min: 8 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { mail, oldPassword, newPassword } = req.body;
    try {
      let user = await User.findOne({ _id: req.params.id });

      if (user) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({
            errors: [{ msg: "Le mot de passe est incorrect" }],
          });
        }

        const salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(newPassword, salt);

        (user = await User.findOneAndUpdate(
          { _id: req.params.id },
          { $set: { password: hashPassword, mail: mail } },
          { new: true }
        )),
          await user.save();
        res.json({ msg: "Vos informations ont bien été enregistrées" });
      } else {
        return res.status(400).json({
          errors: [{ msg: "Utilisateur introuvable" }],
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

export default router;
