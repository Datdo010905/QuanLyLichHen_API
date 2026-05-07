const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKeController');

router.get('/thongke/doanh-thu', thongKeController.getDoanhThuTheoThang)
router.get('/thongke/trang-thai-lich', thongKeController.getThongKeTrangThaiLich);

module.exports = router;