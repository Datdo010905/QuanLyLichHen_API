const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login-taikhoan', loginController.dangNhap);


module.exports = router;