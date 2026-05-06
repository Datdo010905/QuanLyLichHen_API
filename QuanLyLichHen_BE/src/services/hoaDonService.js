const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================= HOÁ ĐƠN =================
const getAllHoaDon = async () => await prisma.hOADON.findMany();

const getHoaDonByID = async (ma) => await prisma.hOADON.findUnique({ where: { MAHD: ma } });

const createHoaDon = async (model) => {
    return await prisma.hOADON.create({
        data: {
            MAHD: model.MAHD || model.mahd,
            // Nếu rỗng thì gán null để không vi phạm khóa ngoại
            MAKH: model.MAKH || model.makh || null,
            MAKM: model.MAKM || model.makm || null,
            MALICH: model.MALICH || model.malich || null,
            MANV: model.MANV || model.manv,
            TONGTIEN: Number(model.TONGTIEN || model.tongtien || 0),
            HINHTHUCTHANHTOAN: model.HINHTHUCTHANHTOAN || model.hinhthucthanhtoan,
            TRANGTHAI: model.TRANGTHAI || model.trangthai,
            // Ép chuẩn ISO cho ngày thanh toán
            NGAYTHANHTOAN: new Date(model.NGAYTT || model.ngaytt)
        }
    });
};

const updateHoaDon = async (ma, model) => {
    return await prisma.hOADON.update({
        where: { MAHD: ma },
        data: {
            MAKH: model.MAKH || model.makh || null,
            MAKM: model.MAKM || model.makm || null,
            MALICH: model.MALICH || model.malich || null,
            MANV: model.MANV || model.manv,
            TONGTIEN: Number(model.TONGTIEN || model.tongtien || 0),
            HINHTHUCTHANHTOAN: model.HINHTHUCTHANHTOAN || model.hinhthucthanhtoan,
            TRANGTHAI: model.TRANGTHAI || model.trangthai,
            NGAYTHANHTOAN: new Date(model.NGAYTT || model.ngaytt)
        }
    });
};

const deleteHoaDon = async (ma) => await prisma.hOADON.delete({ where: { MAHD: ma } });


const getHoaDonTheoNgay = async (ngaybd, ngaykt) => {
    const start = new Date(ngaybd);
    const end = new Date(ngaykt);
    end.setHours(23, 59, 59, 999); 

    return await prisma.hOADON.findMany({
        where: {
            NGAYTHANHTOAN: {
                gte: start, //Greater Than or Equal: >=
                lte: end //Less Than or Equal: <=
            }
        },
        orderBy: {
            NGAYTHANHTOAN: 'desc'
        }
    });
};


// ================= CHI TIẾT HOÁ ĐƠN =================
const getAllCT = async () => await prisma.cHITIETHOADON.findMany();

const getCTByID = async (ma) => await prisma.cHITIETHOADON.findMany({ where: { MAHD: ma } });

const createCT = async (model) => {
    return await prisma.cHITIETHOADON.create({
        data: {
            MAHD: model.MAHD || model.mahd,
            MADV: model.MADV || model.madv,
            SOLUONG: Number(model.SOLUONG || model.soluong),
            DONGIA: Number(model.DONGIA || model.dongia || 0),
            THANHTIEN: Number(model.THANHTIEN || model.thanhtien || 0),
        }
    });
};

const deleteCT = async (ma) => await prisma.cHITIETHOADON.deleteMany({ where: { MAHD: ma } });


const createHoaDonWithDetails = async (invoiceModel, detailsArray) => {

    return await prisma.$transaction(async (tx) => {
        
        //Tạo Hóa Đơn
        const newInvoice = await tx.hOADON.create({
            data: {
                MAHD: invoiceModel.MAHD || invoiceModel.mahd,
                MAKH: invoiceModel.MAKH || invoiceModel.makh || null,
                MAKM: invoiceModel.MAKM || invoiceModel.makm || null,
                MALICH: invoiceModel.MALICH || invoiceModel.malich || null,
                MANV: invoiceModel.MANV || invoiceModel.manv,
                TONGTIEN: Number(invoiceModel.TONGTIEN || invoiceModel.tongtien || 0),
                HINHTHUCTHANHTOAN: invoiceModel.HINHTHUCTHANHTOAN || invoiceModel.hinhthucthanhtoan,
                TRANGTHAI: invoiceModel.TRANGTHAI || invoiceModel.trangthai,
                NGAYTHANHTOAN: new Date(invoiceModel.NGAYTT || invoiceModel.ngaytt)
            }
        });

        //chi tiết hoá đơn
        //thêm mã hd và gắn lại
        const detailsToInsert = detailsArray.map(item => ({
            MAHD: newInvoice.MAHD,
            MADV: item.MADV || item.madv,
            SOLUONG: Number(item.SOLUONG || item.soluong),
            DONGIA: Number(item.DONGIA || item.dongia || 0),
            THANHTIEN: Number(item.THANHTIEN || item.thanhtien || 0),
        }));

        // Insert chi tiết
        await tx.cHITIETHOADON.createMany({
            data: detailsToInsert
        });


        return newInvoice;
    });
};

const deleteHoaDonWithDetails = async (mahd) => {
    return await prisma.$transaction(async (tx) => {
        await tx.cHITIETHOADON.deleteMany({
            where: { MAHD: mahd }
        });

        const deletedInvoice = await tx.hOADON.delete({
            where: { MAHD: mahd }
        });

        return deletedInvoice;
    });
};
module.exports = {
    getAllHoaDon, getHoaDonByID, createHoaDon, updateHoaDon, deleteHoaDon, getHoaDonTheoNgay,
    getAllCT, getCTByID, createCT, deleteCT, createHoaDonWithDetails, deleteHoaDonWithDetails
};