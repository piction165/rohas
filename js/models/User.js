const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" } // 사용자 역할 추가
});

module.exports = mongoose.model("User", UserSchema);
