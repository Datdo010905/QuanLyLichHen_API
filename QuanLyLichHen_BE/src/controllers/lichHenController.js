const lichHenService = require('../services/lichHenService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//API (LỊCH HẸN)
const getAll = async (req, res) => {
    try {
        const data = await lichHenService.getAllLichHen();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getByID = async (req, res) => {
    try {
        const data = await lichHenService.getLichHenByID(req.params.id);
        if (data) return res.status(200).json({
            success: true,
            data: data
        });
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getByIDKH = async (req, res) => {
    try {
        const data = await lichHenService.getLichHenByIDKH(req.params.id);
        if (data) return res.status(200).json({
            success: true,
            data: data
        });
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const create = async (req, res) => {
    try {
        const data = req.body;
        const exist = await lichHenService.getLichHenByID(data.MALICH || data.malich);
        if (exist) return res.status(400).json({
            success: false,
            message: "Mã lịch hẹn đã tồn tại!"
        });

        const newData = await lichHenService.createLichHen(data);
        return res.status(201).json({
            success: true,
            message: "Thêm thành công!",
            data: newData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        // Lấy ID từ URL, lấy Trạng thái từ Body JSON
        const id = req.params.id;
        const trangThai = req.body.TRANGTHAI || req.body.trangthai;

        const updatedData = await lichHenService.updateTrangThai(id, trangThai);
        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công!",
            data: updatedData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const remove = async (req, res) => {
    try {
        await lichHenService.deleteLichHen(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa thành công!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllTheoNgay = async (req, res) => {
    try {
        const { ngaybd, ngaykt } = req.query; // Hứng từ URL (VD: ?ngaybd=...&ngaykt=...)
        if (!ngaybd || !ngaykt) {
            return res.status(400).json({ success: false, message: "Thiếu ngày bắt đầu hoặc kết thúc!" });
        }

        const data = await lichHenService.getLichHenTheoNgay(ngaybd, ngaykt);
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



//API (CHI TIẾT LỊCH HẸN)
const getAllCT = async (req, res) => {
    try {
        const data = await lichHenService.getAllCT();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCTByID = async (req, res) => {
    try {
        const data = await lichHenService.getCTByID(req.params.id);
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createCT = async (req, res) => {
    try {
        const newData = await lichHenService.createCT(req.body);
        return res.status(201).json({
            success: true,
            message: "Thêm chi tiết thành công!",
            data: newData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updateCT = async (req, res) => {
    try {
        const id = req.params.id;
        // Hứng cục JSON { "GHICHU": "..." } từ React gửi lên
        const ghichu = req.body.GHICHU || req.body.ghichu || 'Không có ghi chú';

        await lichHenService.updateCT(id, ghichu);
        return res.status(200).json({ success: true, message: "Cập nhật ghi chú thành công!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Nhớ xuất cái updateCT này ra ở module.exports nhé
const removeCT = async (req, res) => {
    try {
        await lichHenService.deleteCT(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa chi tiết thành công!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const createBookingTransaction = async (req, res) => {
    try {
        const { booking, details } = req.body;

        //chuyển về iso
        booking.NGAYHEN = new Date(booking.NGAYHEN).toISOString();

        booking.GIOHEN = new Date(`1970-01-01T${booking.GIOHEN}:00.000Z`);

        const result = await prisma.$transaction(async (tx) => {

            //Tạo Lịch Hẹn
            const newBooking = await tx.lICHHEN.create({
                data: booking
            });

            //Lấy MALICH vừa tạo
            details.MALICH = newBooking.MALICH;

            //Tạo Chi Tiết Lịch Hẹn
            const newBookingDetail = await tx.cHITIETLICHHEN.create({
                data: details
            });

            return { newBooking, newBookingDetail };
        });

        return res.status(200).json({
            success: true,
            message: "Thêm lịch hẹn thành công!",
            data: result
        });

    } catch (error) {
        console.error("Lỗi Transaction Booking:", error);

        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: "Mã lịch hẹn đã tồn tại!" });
        }

        return res.status(500).json({ success: false, message: "Thao tác thất bại, hệ thống đã tự động hoàn tác!" });
    }
};

const deleteFullBookingTransaction = async (req, res) => {
    try {
        // Lấy id từ URL (/api/lichhen/delete-full/LH001)
        const id = req.params.id;

        
        await prisma.$transaction(async (tx) => {

            //Xóa tất cả chi tiết
            //Dùng deleteMany vì 1 lịch hẹn có thể có nhiều chi tiết
            await tx.cHITIETLICHHEN.deleteMany({
                where: { MALICH: id }
            });

            //Xóa lịch hẹn gốc
            await tx.lICHHEN.delete({
                where: { MALICH: id }
            });

        });

        return res.status(200).json({
            success: true,
            message: "Đã xóa thành công lịch hẹn và chi tiết!"
        });

    } catch (error) {
        console.error("Lỗi Transaction Xóa Booking:", error);

        // lỗi không tìm thấy bản ghi
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn này trong hệ thống!" });
        }

        return res.status(500).json({ success: false, message: "Lỗi máy chủ, không thể xóa lịch hẹn lúc này!" });
    }
};


module.exports = {
    getAll,
    getByID,
    getByIDKH,
    create,
    updateStatus,
    remove,
    getAllTheoNgay,
    getAllCT,
    getCTByID,
    createCT,
    updateCT,
    removeCT,
    createBookingTransaction,
    deleteFullBookingTransaction
};