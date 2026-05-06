const nhanVienService = require('../services/nhanVienService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res) => {
    try {
        const data = await nhanVienService.getAllNhanVien();
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getByID = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await nhanVienService.getNhanVienByID(id);
        if (data) return res.status(200).json({ success: true, data: data });
        return res.status(404).json({ success: false, message: "Không tìm thấy!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const data = req.body;
        const maNV = data.MANV || data.manv;
        const maTK = data.MATK || data.matk;
        const sdt = data.SDT || data.sdt;

        const dt = await nhanVienService.getNhanVienByID(maNV);
        if (dt) return res.status(400).json({ success: false, message: `Mã ${maNV} đã tồn tại!` });

        const dtcheck = await nhanVienService.checkAccTonTai(maNV, maTK);
        if (dtcheck) return res.status(400).json({ success: false, message: `Tài khoản ${maTK} đã có người dùng!` });

        const dtchecksdt = await nhanVienService.checkSDTTonTai(maNV, sdt);
        if (dtchecksdt) return res.status(400).json({ success: false, message: `SĐT ${sdt} đã có người dùng!` });

        const newData = await nhanVienService.createNhanVien(data);
        return res.status(201).json({ success: true, message: "Thêm thành công!", data: newData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const maTK = data.MATK || data.matk;
        const sdt = data.SDT || data.sdt;

        const dtcheck = await nhanVienService.checkAccTonTai(id, maTK);
        if (dtcheck) return res.status(400).json({ success: false, message: `Tài khoản ${maTK} đã có người dùng!` });

        const dtchecksdt = await nhanVienService.checkSDTTonTai(id, sdt);
        if (dtchecksdt) return res.status(400).json({ success: false, message: `SĐT ${sdt} đã có người dùng!` });

        const updatedData = await nhanVienService.updateNhanVien(id, data);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        await nhanVienService.deleteNhanVien(id);
        return res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        if (error.code === 'P2003') return res.status(400).json({ success: false, message: "Nhân viên đang có lịch hẹn, không thể xóa!" });
        return res.status(500).json({ success: false, message: error.message });
    }
};



const createWithAccount = async (req, res) => {
    try {
        // Nhận TẤT CẢ data từ Frontend gửi lên trong 1 lần
        const { MANV, HOTEN, CHUCVU, SDT, DIACHI, MACHINHANH, NGAYSINH, PASS, PHANQUYEN, TRANGTHAI } = req.body;

        //Check trùng SDT
        const checkSDT = await prisma.nHANVIEN.findFirst({ where: { SDT: SDT.trim() } });
        if (checkSDT) {
            return res.status(400).json({ success: false, message: "Số điện thoại đã tồn tại!" });
        }

        //TRANSACTION: dùng cả 2 service trong 1 transaction để đảm bảo tính nhất quán dữ liệu
        const result = await prisma.$transaction(async (tx) => {

            //Tạo Tài khoản
            const newTaiKhoan = await tx.tAIKHOAN.create({
                data: {
                    MATK: MANV.trim(),
                    PASS: SDT.trim(),
                    PHANQUYEN: Number(PHANQUYEN),
                    TRANGTHAI: TRANGTHAI.trim()
                }
            });

            //Tạo nhân viên
            const newNhanVien = await tx.nHANVIEN.create({
                data: {
                    MANV: MANV.trim(),
                    HOTEN: HOTEN.trim(),
                    CHUCVU: CHUCVU.trim(),
                    SDT: SDT.trim(),
                    DIACHI: DIACHI.trim(),
                    MACHINHANH: MACHINHANH.trim(),
                    // Ép chuỗi ngày tháng từ React sang chuẩn Date của Prisma
                    NGAYSINH: new Date(NGAYSINH),
                    MATK: MANV.trim(),
                }
            });

            // Trả về cả 2 nếu thành công
            return { newTaiKhoan, newNhanVien };
        });

        //lưu thành công
        return res.status(200).json({
            success: true,
            message: "Thêm mới tài khoản và nhân viên thành công!",
            data: result
        });

    } catch (error) {
        console.error("Lỗi Transaction:", error);
        // Bắt lỗi Unique của Prisma
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: "Dữ liệu bị trùng lặp!" });
        }
        return res.status(500).json({ success: false, message: "Lỗi máy chủ, thao tác đã bị hoàn tác!" });
    }
};


const deleteFullStaffTransaction = async (req, res) => {
    try {
        // Lấy id từ URL
        const id = req.params.id;


        await prisma.$transaction(async (tx) => {

            //Xóa nhân viên
            await tx.nHANVIEN.delete({
                where: { MANV: id }
            });

            //Xóa tài khoản
            await tx.tAIKHOAN.delete({
                where: { MATK: id }
            });

        });

        return res.status(200).json({
            success: true,
            message: "Đã xóa thành công nhân viên và tài khoản!"
        });

    } catch (error) {
        console.error("Lỗi Transaction Xóa nhân viên:", error);

        // lỗi không tìm thấy bản ghi
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên này trong hệ thống!" });
        }
        if (error.code === 'P2003') return res.status(400).json({ success: false, message: "Nhân viên đang có lịch hẹn, không thể xóa!" });


        return res.status(500).json({ success: false, message: "Lỗi máy chủ, không thể xóa nhân viên lúc này!" });
    }
};

module.exports = { getAll, getByID, create, update, remove, createWithAccount, deleteFullStaffTransaction };