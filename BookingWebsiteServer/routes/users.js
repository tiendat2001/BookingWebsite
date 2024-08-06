import express from "express"
import { deleteUser, getUser, getUsers, updateUser } from "../controllers/user.js";
import { verifyAdmin, verifyUser,verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// router.get("/checkauthentication", verifyToken, (req, res, next) => {
//     res.send("hello user")
// });

// router.get("/checkuser/:id", verifyUser, (req, res, next) => {
//     res.send("hello user, you can delete your account")
// });

// router.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
//     res.send("hello admin, you are admin")
// });
//UPDATE
router.put("/", verifyToken, updateUser);
//DELETE
router.delete("/:id", verifyUser, deleteUser);
//GET
router.get("/getUserByTokenId",  verifyToken, getUser);
//GETALL
router.get("/", getUsers);

export default router