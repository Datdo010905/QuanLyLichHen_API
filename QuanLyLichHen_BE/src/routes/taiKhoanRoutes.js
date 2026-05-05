// File: src/routes/taiKhoanRoutes.js
const express = require('express');
const router = express.Router();
const taiKhoanController = require('../controllers/taiKhoanController');

router.get('/get-all-taikhoan', taiKhoanController.getAll);

router.get('/get-byId-taikhoan/:id', taiKhoanController.getByID);
router.put('/update-taikhoan/:id', taiKhoanController.update);
router.delete('/delete-taikhoan/:id', taiKhoanController.remove);

router.post('/insert-taikhoan', taiKhoanController.create);

router.post('/forgot-password', taiKhoanController.forgotPassword);

module.exports = router;