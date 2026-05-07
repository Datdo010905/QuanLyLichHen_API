const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//LỊCH HẸN
const getAllLichHen = async () => await prisma.lICHHEN.findMany();

const getLichHenByID = async (ma) => await prisma.lICHHEN.findUnique({ where: { MALICH: ma } });

const getLichHenByIDKH = async (ma) => await prisma.lICHHEN.findMany({ where: { MAKH: ma } });

const getLichHenTheoNhanVien = async (matk) => {

    const cleanMatk = matk.trim();

    //TÌM MÃ NHÂN VIÊN TỪ TÀI KHOẢN
    const nhanVien = await prisma.nHANVIEN.findFirst({
        where: {
            MATK: cleanMatk
        }
    });
    if (!nhanVien) {
        console.log("Tài khoản này chưa được liên kết với nhân viên nào!");
        return [];
    }

    const manvThucTe = nhanVien.MANV;

    return await prisma.lICHHEN.findMany({
        where: {
            // Lọc những Lịch hẹn mà có ít nhất một chi tiết chứa MANV này
            CHITIETLICHHEN: {
                some: {
                    MANV: manvThucTe
                }
            }
        },
        // lấy thông tin liên quan
        include: {
            KHACHHANG: true,
            CHITIETLICHHEN: {
                where: { MANV: manvThucTe } //lấy đúng phần việc của ông stylist này
            }
        },
        orderBy: {
            NGAYHEN: 'desc' // Lịch mới nhất hiện lên đầu
        }
    });
};

const createLichHen = async (model) => {
    const gioGoc = model.GIOHEN || model.giohen;

    // tạo thành chuỗi chuẩn ISO
    const gioHenChuanISO = new Date(`1970-01-01T${gioGoc}:00.000Z`);

    const maKH = (model.MAKH || model.makh).trim();

    return await prisma.lICHHEN.create({
        data: {
            MALICH: model.MALICH || model.malich,
            NGAYHEN: new Date(model.NGAYHEN || model.ngayhen),
            GIOHEN: gioHenChuanISO,
            TRANGTHAI: model.TRANGTHAI || model.trangthai,
            MACHINHANH: model.MACHINHANH || model.machinhanh,
            MAKH: maKH // Đã được gọt sạch khoảng trắng
        }
    });
};
const updateTrangThai = async (ma, trangthai) => {
    return await prisma.lICHHEN.update({
        where: { MALICH: ma },
        data: { TRANGTHAI: trangthai }
    });
};

const deleteLichHen = async (ma) => await prisma.lICHHEN.delete({ where: { MALICH: ma } });

const getLichHenTheoNgay = async (ngaybd, ngaykt) => {
    const start = new Date(ngaybd);
    const end = new Date(ngaykt);
    end.setHours(23, 59, 59, 999); // Lấy đến tận 23:59:59 của ngày kết thúc

    return await prisma.lICHHEN.findMany({
        where: {
            NGAYHEN: {
                gte: start, // Lớn hơn hoặc bằng ngày bắt đầu
                lte: end    // Nhỏ hơn hoặc bằng ngày kết thúc
            }
        },
        orderBy: {
            NGAYHEN: 'desc' // Sắp xếp giảm dần y hệt C#
        }
    });
};

// Nhớ ném getLichHenTheoNgay vào module.exports nhé bro!


//CHI TIẾT LỊCH HẸN
const getAllCT = async () => await prisma.cHITIETLICHHEN.findMany();

const getCTByID = async (ma) => {

    // Dùng findMany thay unique
    return await prisma.cHITIETLICHHEN.findMany({ where: { MALICH: ma } });
};

const createCT = async (model) => {
    return await prisma.cHITIETLICHHEN.create({
        data: {
            MALICH: model.MALICH || model.malich,
            MADV: model.MADV || model.madv,
            MANV: model.MANV || model.manv,
            SOLUONG: Number(model.SOLUONG || model.soluong),
            GIA_DUKIEN: Number(model.GIA_DUKIEN || model.giA_DUKIEN || 0),
            GHICHU: model.GHICHU || model.ghichu || 'Không có ghi chú'
        }
    });
};
const updateCT = async (ma, ghichu) => {
    return await prisma.cHITIETLICHHEN.updateMany({
        where: { MALICH: ma },
        data: { GHICHU: ghichu }
    });
};

// Nhớ ném updateCT vào module.exports ở cuối file nhé!
const deleteCT = async (ma) => {
    //deleteMany xoá những lịch liên quan "ma"
    return await prisma.cHITIETLICHHEN.deleteMany({ where: { MALICH: ma } });
};

module.exports = {
    getAllLichHen, getLichHenByID, getLichHenByIDKH, getLichHenTheoNhanVien, createLichHen, updateTrangThai, deleteLichHen, getLichHenTheoNgay,
    getAllCT, getCTByID, createCT, updateCT, deleteCT
};