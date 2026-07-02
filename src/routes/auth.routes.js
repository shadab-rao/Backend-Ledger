const express = require("express")
const authController = require("../controllers/auth.controllers")

const app = express()
const router = express.Router()

router.post("/register" , authController.registerUserController)
router.post("/login", authController.loginUserController)

module.exports = router