import express from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import mongoose from "mongoose";

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

// Check Password
const checkPassword = async (id, password) => {
  let isValidID = mongoose.Types.ObjectId.isValid(id); // Check ID for "cast fails error"
  if (isValidID) {
    let user = await User.findById(id);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return "Le mot de passe est incorrect";
      } else {
        return true;
      }
    } else {
      return "Utilisateur introuvable";
    }
  } else {
    return "ID invalide";
  }
};

// @route   PUT api/users/password/:id
// @desc    Change password
// @access  Private
router.put(
  "/password/:id",
  [
    auth,
    [
      check("oldPassword", "Veuillez entrer votre mot de passe")
        .not()
        .isEmpty(),
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
    const { oldPassword, newPassword } = req.body;
    try {
      const isMatch = checkPassword(req.params.id, oldPassword);

      isMatch.then(async (result) => {
        if (result === true) {
          const salt = await bcrypt.genSalt(10);
          let hashPassword = await bcrypt.hash(newPassword, salt);
          let user = await User.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { password: hashPassword } },
            { new: true }
          );
          await user.save();
          res.json({ msg: "Le mot de passe a bien été modifié" });
        } else {
          return res.status(400).json({
            errors: [{ msg: result }],
          });
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

export default router;
