require("dotenv").config(); // .env 파일 로드
const express = require("express");
const connectDB = require("./config"); // MongoDB 연결 파일
const authRoutes = require("./routes/auth"); // 로그인 관련 API
const cors = require("cors");

const app = express();
app.use(express.json()); // JSON 요청 처리
app.use(cors()); // CORS 허용 (프론트엔드와 연동 가능)

connectDB(); // MongoDB 연결 실행

// API 라우터 등록
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중... 포트: ${PORT}`));
