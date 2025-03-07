const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ 승인 대기 중인 사용자 조회
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select("-password");
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ error: "승인 대기 사용자 목록 조회 실패" });
  }
});

// ✅ 관리자 승인 API
router.put("/approve/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    user.isApproved = true;
    await user.save();

    // 문자 메시지 발송 (SMS API 연동 필요)
    console.log(`✅ 사용자 승인 완료: ${user.phoneNumber}`);

    res.json({ message: "사용자 승인 완료" });
  } catch (error) {
    res.status(500).json({ error: "승인 처리 실패" });
  }
});

// ✅ 회원가입 API
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    // 이메일 또는 연락처 중복 확인
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ message: "이미 등록된 전화번호입니다." });

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 승인 대기 상태로 사용자 저장
    const newUser = new User({ username, email, password: hashedPassword, phoneNumber });
    await newUser.save();

    res.status(201).json({ message: "회원가입 완료! 관리자의 승인을 기다려주세요." });
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
