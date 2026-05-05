const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllKhachHang = async () => {
    return await prisma.kHACHHANG.findMany();
};


const getKhachHangByID = async (ma) => {
    return await prisma.kHACHHANG.findFirst({
        where: {
            OR: [
                { MAKH: ma },
                { SDT: ma }
            ]
        }
    });
};

const checkSDTTonTai = async (ma, sdt) => {
    return await prisma.kHACHHANG.findFirst({
        where: {
            SDT: sdt,
            MAKH: { not: ma } // Lệnh "khác" trong Prisma
        }
    });
};

const createKhachHang = async (model) => {
    return await prisma.kHACHHANG.create({
        data: {
            //check cả chữ HOA lẫn chữ thường từ React do FE có thể gửi lên không đồng nhất
            MAKH: model.MAKH || model.makh,
            HOTEN: model.HOTEN || model.hoten,
            SDT: model.SDT || model.sdt,
            MATK: model.MATK || model.matk || null,
            EMAIL: model.EMAIL || model.email || null
        }
    });
};

const updateKhachHang = async (ma, model) => {
    return await prisma.kHACHHANG.update({
        where: { MAKH: ma },
        data: {
            HOTEN: model.HOTEN || model.hoten,
            SDT: model.SDT || model.sdt
        }
    });
};

const deleteKhachHang = async (ma) => {
    return await prisma.kHACHHANG.deleteMany({
        where: {
            OR: [
                { MAKH: ma },
                { SDT: ma }
            ]
        }
    });
};

module.exports = {
    getAllKhachHang, getKhachHangByID, checkSDTTonTai, createKhachHang, updateKhachHang, deleteKhachHang
};