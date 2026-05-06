const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');

// Route Hoá Đơn
router.get('/get-all-HoaDon', hoaDonController.getAll);
router.get('/get-byId-HoaDon/:id', hoaDonController.getByID);
router.post('/insert-HoaDon', hoaDonController.create);
router.put('/update-HoaDon/:id', hoaDonController.update);
router.delete('/delete-HoaDon/:id', hoaDonController.remove);
router.get('/get-all-hoadonTheoNgay', hoaDonController.getAllTheoNgay);
// Route Chi Tiết
router.get('/get-all-CTHoaDon', hoaDonController.getAllCT);
router.get('/get-byId-CTHoaDon/:id', hoaDonController.getCTByID);
router.post('/insert-CTHoaDon', hoaDonController.createCT);
router.delete('/delete-CTHoaDon/:id', hoaDonController.removeCT);

router.post('/insert-HoaDonvaChiTiet', hoaDonController.createFull);
router.delete('/delete-HoaDonvaChiTiet/:id', hoaDonController.deleteFull);
module.exports = router;