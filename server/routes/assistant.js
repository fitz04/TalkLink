const express = require('express');
const router = express.Router();

// 임시 어시스턴트 검색 엔드포인트
router.post('/search', (req, res) => {
    // 실제 검색 로직 구현 전까지 더미 응답 반환
    res.json({
        results: [],
        assistantMessage: "검색 기능은 아직 구현 중입니다."
    });
});

module.exports = router;
