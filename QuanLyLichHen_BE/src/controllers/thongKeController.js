const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDoanhThuTheoThang = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại (2026)

        //Lấy tất cả hóa đơn đã hoàn thành trong năm nay
        const danhSachHoaDon = await prisma.hOADON.findMany({
            where: {
                TRANGTHAI: "Đã thanh toán",
                NGAYTHANHTOAN: {
                    gte: new Date(`${currentYear}-01-01`),
                    lte: new Date(`${currentYear}-12-31`)
                }
            }
        });

        //Tạo mảng 12 tháng với doanh thu ban đầu là 0
        const doanhThuThang = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            DoanhThu: 0
        }));

        //lặp cộng dồn tiền vào từng tháng
        danhSachHoaDon.forEach(hd => {
            const thang = new Date(hd.NGAYTHANHTOAN).getMonth(); // getMonth() trả về từ 0-11
            doanhThuThang[thang].DoanhThu += Number(hd.TONGTIEN) || 0; 
        });

        return res.status(200).json({
            success: true,
            data: doanhThuThang
        });

    } catch (error) {
        console.error("Lỗi thống kê doanh thu:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};




const getThongKeTrangThaiLich = async (req, res) => {
    try {
        //đếm số lượng lịch hẹn theo từng tên TRANGTHAI
        const result = await prisma.lICHHEN.groupBy({
            by: ['TRANGTHAI'],
            _count: {
                TRANGTHAI: true,
            },
        });

        //chỉnh lại data có FE { name: 'Đã hủy', value: 5 }
        const formattedData = result.map(item => ({
            name: item.TRANGTHAI || 'Chưa xác định',
            value: item._count.TRANGTHAI
        }));

        return res.status(200).json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error("Lỗi thống kê trạng thái lịch:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};

module.exports = { getDoanhThuTheoThang, getThongKeTrangThaiLich };