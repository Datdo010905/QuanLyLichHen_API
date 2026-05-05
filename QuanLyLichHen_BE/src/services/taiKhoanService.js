const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkLogin = async (username, password) => {
    //Prisma ORM tìm tài khoản
    const user = await prisma.tAIKHOAN.findFirst({
        where: {
            MATK: username,
            PASS: password
        }
    });
    return user;
};
// Hàm check xem mã tài khoản đã tồn tại chưa
const checkTaiKhoanTonTai = async (maTK) => {
    return await prisma.tAIKHOAN.findUnique({
        where: { MATK: maTK }
    });
};

// Hàm thêm tài khoản mới
const createTaiKhoan = async (model) => {
    return await prisma.tAIKHOAN.create({
        data: {
            MATK: model.MATK,
            PASS: model.PASS,
            PHANQUYEN: Number(model.PHANQUYEN),
            TRANGTHAI: model.TRANGTHAI
        }
    });
};
const getAllTaiKhoan = async () => {
    //tìm all 
    return await prisma.tAIKHOAN.findMany();
};

const updateTaiKhoan = async (ma, model) => {
    return await prisma.tAIKHOAN.update({
        where: { MATK: ma },
        data: {
            PASS: model.PASS,
            PHANQUYEN: Number(model.PHANQUYEN),
            TRANGTHAI: model.TRANGTHAI
        }
    });
};

const deleteTaiKhoan = async (ma) => {
    return await prisma.tAIKHOAN.delete({
        where: { MATK: ma }
    });
};



module.exports = {
    checkLogin,
    checkTaiKhoanTonTai,
    createTaiKhoan,
    getAllTaiKhoan,
    updateTaiKhoan,
    deleteTaiKhoan  
};