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
        const doanhThuThang = Array.from(
            //giá trị ban đầu ko dùng nên '_'
            { length: 12 }, (_, i) => ({
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

        const { ngaybd, ngaykt } = req.query; // Hứng từ URL (VD: ?ngaybd=...&ngaykt=...)
        if (!ngaybd || !ngaykt) {
            return res.status(400).json({ success: false, message: "Thiếu ngày bắt đầu hoặc kết thúc!" });
        }
        const danhSachLichHen = await prisma.lICHHEN.groupBy({
            by: ['TRANGTHAI'], // Gom theo trạng thái
            where: {
                NGAYHEN: {
                    gte: new Date(ngaybd), // Lớn hơn hoặc bằng ngày bắt đầu
                    lte: new Date(ngaykt)    // Nhỏ hơn hoặc bằng ngày kết thúc
                }
            },
            _count: {
                TRANGTHAI: true // Đếm số lượng của từng trạng thái
            }
        });

        //chỉnh lại data cho FE
        //map duyệt để tạo ra mảng mới, mỗi item sẽ thành obj mới: vd { name: 'Đã hủy', value: 5 }
        const formattedData = danhSachLichHen.map(item => ({
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


const getThongKeKhungGio = async (req, res) => {
    try {
        const { ngaybd, ngaykt } = req.query; // Hứng từ URL (VD: ?ngaybd=...&ngaykt=...)
        if (!ngaybd || !ngaykt) {
            return res.status(400).json({ success: false, message: "Thiếu ngày bắt đầu hoặc kết thúc!" });
        }

        const danhSachLich = await prisma.lICHHEN.findMany({
            where: {
                //TRANGTHAI != 'Đã hủy',
                NGAYHEN: {
                    gte: new Date(ngaybd),
                    lte: new Date(ngaykt)
                },
            },
            select: { GIOHEN: true, NGAYHEN: true }//lấy mỗi giờ hẹn và ngày hẹn
        });

        //tạo mảng giờ hành chính, có số lượng khách ban đầu là 0
        const khungGioMap = {};
        for (let i = 8; i <= 22; i++) {
            khungGioMap[`${i}:00`] = 0;
        }

        //Vòng lặp đếm số lượng khách theo từng múi giờ
        danhSachLich.forEach(lich => {

            const thoiGian = lich.GIOHEN || lich.NGAYHEN;

            if (thoiGian) {
                const hour = new Date(thoiGian).getHours(); // Lấy số giờ (VD: 14h30 sẽ là 14)

                // Chỉ đếm nếu nằm trong giờ
                if (hour >= 8 && hour <= 22) {
                    khungGioMap[`${hour}:00`] += 1;//cộng slg khách
                }
            }
        });

        //Ép kiểu lại cho Frontend
        //Lấy toàn bộ key của object thành mảng và map
        const formattedData = Object.keys(khungGioMap).map(gio => ({
            time: gio,
            soLuong: khungGioMap[gio]
        }));

        return res.status(200).json({ success: true, data: formattedData });

    } catch (error) {
        console.error("Lỗi thống kê khung giờ:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
    }
};


module.exports = { getDoanhThuTheoThang, getThongKeTrangThaiLich, getThongKeKhungGio };