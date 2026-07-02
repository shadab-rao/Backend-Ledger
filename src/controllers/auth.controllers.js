const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendMail = require("../services/sendMail");

async function registerUserController(req, res) {
  const { email, name, password } = req.body;

  const isExistUser = await userModel.findOne({ email: email });
  if (isExistUser) {
    return res.status(422).json({
      message: "User already exists",
    });
  }

  const user = await userModel.create({
    email: email,
    name: name,
    password: password,
  });

  try {
    await sendMail(
      user.email,
      "Welcome to Backend Ledger",
      `
      <h2>Welcome ${user.name} 🎉</h2>
      <p>Your account has been created successfully.</p>
      <p>Thank you for joining Backend Ledger.</p>
    `,
    );
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Email or Password is Invalid",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(200).json({
    message: "User created successfully",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

module.exports = {
  registerUserController,
  loginUserController,
};
