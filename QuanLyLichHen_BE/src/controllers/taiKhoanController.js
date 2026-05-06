const taiKhoanService = require('../services/taiKhoanService');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
    try {
        const data = await taiKhoanService.getAllTaiKhoan();
        return res.status(200).json({ success: true, message: "Lấy danh sách tài khoản thành công!", data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi: " + error.message });
    }
};

const getByID = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await taiKhoanService.checkTaiKhoanTonTai(id);

        if (data) {
            return res.status(200).json({ success: true, message: "Tìm thấy tài khoản thành công!", data: data });
        } else {
            return res.status(404).json({ success: false, message: `Không tìm thấy tài khoản có mã: '${id}'` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi: " + error.message });
    }
};

const create = async (req, res) => {
    try {
        // Lấy dữ liệu từ body
        const data = req.body;
        const isExist = await taiKhoanService.checkTaiKhoanTonTai(data.MATK);

        if (!isExist) {
            const newData = await taiKhoanService.createTaiKhoan(data);
            return res.status(201).json({ success: true, message: "Thêm thông tin tài khoản thành công!", data: newData });
        } else {
            return res.status(400).json({ success: false, message: `Đã tồn tại tài khoản có mã: '${data.MATK}'` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi: " + error.message });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id; // Lấy ID từ URL
        const data = req.body;

        const isExist = await taiKhoanService.checkTaiKhoanTonTai(id);
        if (isExist) {
            const updatedData = await taiKhoanService.updateTaiKhoan(id, data);
            return res.status(200).json({ success: true, message: "Thay đổi thông tin tài khoản thành công!", data: updatedData });
        } else {
            return res.status(404).json({ success: false, message: `Không tồn tại tài khoản có mã: '${id}' để thay đổi` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi: " + error.message });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        const isExist = await taiKhoanService.checkTaiKhoanTonTai(id);

        if (isExist) {
            await taiKhoanService.deleteTaiKhoan(id);
            return res.status(200).json({ success: true, message: "Xoá thông tin tài khoản thành công!" });
        } else {
            return res.status(404).json({ success: false, message: `Không tồn tại tài khoản có mã: '${id}' để xoá` });
        }
    } catch (error) {
        // Bắt lỗi khóa ngoại nếu tài khoản đang dính tới Khách Hàng hoặc Thợ
        if (error.message.includes('Foreign key constraint failed') || error.code === 'P2003') {
            return res.status(400).json({ success: false, message: "Tài khoản này đang được sử dụng, không thể xóa!" });
        }
        return res.status(500).json({ success: false, message: "Lỗi: " + error.message });
    }
};




// CẤU HÌNH NGƯỜI GỬI EMAIL (SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dotiendat01092005@gmail.com', 
        pass: 'gyku wkzp xhep xzgt'  //mã app auth
    }
});

const forgotPassword = async (req, res) => {
    try {
        const { email, sdt } = req.body; // Giao diện yêu cầu nhập SDT và Email

        // check 
        const khachHang = await prisma.kHACHHANG.findFirst({
            where: { SDT: sdt, EMAIL: email } 
        });

        if (!khachHang) {
            return res.status(404).json({ success: false, message: "Thông tin không chính xác hoặc không tồn tại!" });
        }

        //Tạo mật khẩu mới 6 số ngẫu nhiên 
        const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

        //lưu lại pass vào db
        await prisma.tAIKHOAN.update({
            where: { MATK: sdt },
            data: { PASS: newPassword }
        });

        //Gửi Email
        const mailOptions = {
            from: '"Hệ thống 30Shine Clone" <dotiendat01092005@gmail.com>',
            to: email,//mail của khách hàng
            subject: 'Khôi phục mật khẩu tài khoản',
            html: `
                <h3>Xin chào ${khachHang.HOTEN},</h3>
                <p>Hệ thống đã nhận được yêu cầu cấp lại mật khẩu của bạn.</p>
                <p>Mật khẩu mới của bạn là: <strong style="font-size: 20px; color: red;">${newPassword}</strong></p>
                <p>Vui lòng đăng nhập bằng mật khẩu này và tiến hành đổi mật khẩu mới để bảo mật tài khoản.</p>
                <br/>
                <p>Trân trọng,</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Mật khẩu mới đã được gửi vào Email của bạn!" });

    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ, vui lòng thử lại sau!" });
    }
};



module.exports = { getAll, getByID, create, update, remove, forgotPassword };