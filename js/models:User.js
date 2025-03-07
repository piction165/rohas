const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // 연락처 추가
  isApproved: { type: Boolean, default: false }, // 승인 여부 (기본값: false)
});

module.exports = mongoose.model("User", UserSchema);
