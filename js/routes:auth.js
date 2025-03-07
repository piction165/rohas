const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ 회원가입 API
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "이미 가입된 이메일입니다." });

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "회원가입 성공!" });
  } catch (error) {
    res.status(500).json({ error: "회원가입 실패" });
  }
});

// ✅ 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "이메일을 찾을 수 없습니다." });

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });

    // JWT 토큰 생성
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "로그인 실패" });
  }
});

// ✅ 사용자 정보 조회 (JWT 필요)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "사용자 정보 조회 실패" });
  }
});

module.exports = router;
