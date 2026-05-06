const express = require('express');
const router = express.Router();
const khachHangController = require('../controllers/khachHangController');

router.get('/get-all-khachhang', khachHangController.getAll);
router.get('/get-byId-khachhang/:id', khachHangController.getByID);
router.post('/insert-khachhangVoiTaiKhoan', khachHangController.createCustomerWithAccount);
router.put('/update-khachhang/:id', khachHangController.update);
router.delete('/delete-khachhang/:id', khachHangController.remove);

router.delete('/delete-full/:id', khachHangController.deleteFullCustomerTransaction);

router.put('/update-profile/:id', khachHangController.updateProfileFull);
module.exports = router;