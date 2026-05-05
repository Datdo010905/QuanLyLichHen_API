const taiKhoanService = require('../services/taiKhoanService');
const khachHangService = require('../services/khachHangService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Import package JWT để tạo token
const jwt = require('jsonwebtoken'); 

const dangNhap = async (req, res) => {
    try {
        // Lấy data từ Body
        const { username, pass } = req.body;

        if (!username || !pass) {
            return res.status(400).json({ success: false, message: "Thiếu username hoặc password!" });
        }

        // Kiểm tra đăng nhập
        const user = await taiKhoanService.checkLogin(username, pass);

        if (!user) {
            return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
        }

        //thành công, Sinh Token
        const payload = {
            MaTK: user.MATK,
            PhanQuyen: user.PHANQUYEN
        };

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, // Lấy khóa bí mật từ .env
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Trả về cho Client
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            token: token,
            data: {
                MATK: user.MATK.trim(),
                PASS: user.PASS.trim(),
                PHANQUYEN: user.PHANQUYEN,
                TRANGTHAI: user.TRANGTHAI.trim()
            }
        });

    } catch (error) {
        console.error("Lỗi Đăng Nhập:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
};

module.exports = {
    dangNhap,
};