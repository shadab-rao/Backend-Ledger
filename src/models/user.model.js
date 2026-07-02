const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a user"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required for creating a user"],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating a user"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    systemUser:{
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    }
  },
  {
    timestamps: true, // ✅ Correct
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return 
  }
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  return 
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
