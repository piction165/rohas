const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ✅ 승인 대기 중인 사용자 목록 조회
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select("-password");
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ error: "승인 대기 사용자 조회 실패" });
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

    res.json({ message: "사용자 승인 완료" });
  } catch (error) {
    res.status(500).json({ error: "승인 처리 실패" });
  }
});

module.exports = router;
