const khachHangService = require('../services/khachHangService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res) => {
    try {
        const data = await khachHangService.getAllKhachHang();
        return res.status(200).json({ success: true, message: "Lấy danh sách thành công!", data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getByID = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await khachHangService.getKhachHangByID(id);
        if (data) {
            return res.status(200).json({ success: true, message: "Tìm thấy khách hàng!", data: data });
        } else {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


const createCustomerWithAccount = async (req, res) => {
    try {
        // Nhận TẤT CẢ data từ Frontend gửi lên trong 1 lần
        const { MATK, PASS, PHANQUYEN, TRANGTHAI, HOTEN, SDT, EMAIL } = req.body;

        //Check trùng SDT
        const checkSDT = await prisma.kHACHHANG.findFirst({ where: { SDT: SDT.trim() } });
        if (checkSDT) {
            return res.status(400).json({ success: false, message: "Số điện thoại đã tồn tại!" });
        }

        //Check trùng Email 
        if (EMAIL) {
            const checkEmail = await prisma.kHACHHANG.findFirst({ where: { EMAIL: EMAIL.trim() } });
            if (checkEmail) {
                return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
            }
        }

        //TRANSACTION: dùng cả 2 service trong 1 transaction để đảm bảo tính nhất quán dữ liệu
        const result = await prisma.$transaction(async (tx) => {

            //Tạo Tài khoản
            const newTaiKhoan = await tx.tAIKHOAN.create({
                data: {
                    MATK: SDT.trim(),
                    PASS: PASS.trim(),
                    PHANQUYEN: Number(PHANQUYEN),
                    TRANGTHAI: TRANGTHAI.trim()
                }
            });

            //Tạo Khách hàng
            const newKhachHang = await tx.kHACHHANG.create({
                data: {
                    MAKH: SDT.trim(),
                    HOTEN: HOTEN.trim(),
                    SDT: SDT.trim(),
                    MATK: SDT.trim(),
                    EMAIL: EMAIL.trim()
                }
            });

            // Trả về cả 2 nếu thành công
            return { newTaiKhoan, newKhachHang };
        });

        //lưu thành công
        return res.status(200).json({
            success: true,
            message: "Thêm mới tài khoản và khách hàng thành công!",
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

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const sdt = data.SDT || data.sdt;

        const updatedData = await khachHangService.updateKhachHang(id, data);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        await khachHangService.deleteKhachHang(id);
        return res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ success: false, message: "Khách hàng này đã có lịch hẹn, không thể xóa!" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFullCustomerTransaction = async (req, res) => {
    try {
        // Lấy id từ URL
        const id = req.params.id;


        await prisma.$transaction(async (tx) => {

            //Xóa khách
            await tx.kHACHHANG.delete({
                where: { MAKH: id }
            });

            //Xóa tài khoản
            await tx.tAIKHOAN.delete({
                where: { MATK: id }
            });

        });

        return res.status(200).json({
            success: true,
            message: "Đã xóa thành công khách hàng và tài khoản!"
        });

    } catch (error) {
        console.error("Lỗi Transaction Xóa Khách hàng:", error);

        // lỗi không tìm thấy bản ghi
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng này trong hệ thống!" });
        }

        return res.status(500).json({ success: false, message: "Lỗi máy chủ, không thể xóa khách hàng lúc này!" });
    }
};

const updateProfileFull = async (req, res) => {
    try {
        // Lấy ID (SĐT) từ URL
        const id = req.params.id; 
        
        // Frontend sẽ gửi lên 2 cục data: Thông tin khách hàng và Thông tin tài khoản (nếu có đổi pass)
        const { customerData, accountData } = req.body;

        // Cấm chạm tới Khóa chính để tránh lỗi Khóa ngoại
        if (customerData) {
            delete customerData.MAKH; 
            delete customerData.SDT; 
        }
        
        if (accountData) {
            delete accountData.MATK; 
        }
        const result = await prisma.$transaction(async (tx) => {
            
            //Cập nhật bảng KHACHHANG
            const updatedCustomer = await tx.kHACHHANG.update({
                where: { MAKH: id },
                data: {
                    HOTEN: customerData.HOTEN,
                    EMAIL: customerData.EMAIL
                }
            });

            //Cập nhật bảng TAIKHOAN (Chỉ cập nhật nếu Frontend có gửi accountData lên)
            let updatedAccount = null;
            if (accountData && accountData.PASS && accountData.PASS.trim() !== '') {
                updatedAccount = await tx.tAIKHOAN.update({
                    where: { MATK: id }, 
                    data: {
                        PASS: accountData.PASS
                    }
                });
            }

            return { updatedCustomer, updatedAccount };
        });

        return res.status(200).json({ 
            success: true, 
            message: "Cập nhật hồ sơ thành công!", 
            data: result 
        });

    } catch (error) {
        console.error("Lỗi Transaction Update Profile:", error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu tài khoản!" });
        }
        
        return res.status(500).json({ success: false, message: "Lỗi máy chủ, thao tác đã tự động hoàn tác!" });
    }
};

module.exports = {
    getAll,
    getByID,
    createCustomerWithAccount,
    update,
    remove,
    deleteFullCustomerTransaction,
    updateProfileFull
};