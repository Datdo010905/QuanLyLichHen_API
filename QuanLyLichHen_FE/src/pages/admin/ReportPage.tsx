
import StatCard from "../../components/ui/StatCard";
import React, { useEffect, useState } from "react";
import BookingApi, { Booking, BookingDetails } from "../../api/bookingApi";
import StaffApi, { NhanVien, TopStaffData } from "../../api/staffApi"
import dichVuApi, { DichVu, TopDVData } from "../../api/dichvuApi";
import hoadonApi, { HoaDon, HoaDonDetails } from "../../api/hoadonApi";
import thongkeApi from "../../api/thongkeApi";
import { toast } from "react-toastify";
import DataTable, { Column } from '../../components/ui/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
const ReportPage = () => {

    // const [totalLichHen, setTotalLichHen] = useState(0);
    // const [totalHoaDon, setTotalHoaDon] = useState(0);

    const [dataChart, setDataChart] = useState([]);
    const [dataTrangThai, setDataTrangThai] = useState([]);

    const [bookingList, setbookingList] = useState<Booking[]>([]);
    const [bookingDetailsList, setbookingDetailsList] = useState<BookingDetails[]>([]);
    const [hoadonList, setHoadonList] = useState<HoaDon[]>([]);
    const [hoadonDetailsList, setHoadonDetailsList] = useState<HoaDonDetails[]>([]);

    const [HoaDonList, setHoaDonList] = useState<HoaDon[]>([]);
    const [NhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
    const [DichVuList, setDichVuList] = useState<DichVu[]>([]);

    const [TopNV, setTopNV] = useState<TopStaffData[]>([]);
    const [TopDV, setTopDV] = useState<TopDVData[]>([]);

    const [lichTC, setLTC] = useState(0);
    const [tongDT, settongDT] = useState(0);
    const [HoaDonDTT, setHoaDonDTT] = useState(0);

    const fetchData = async () => {

        const resBooking = await BookingApi.getAll();
        const resBookingCT = await BookingApi.getAllCT();
        const resHD = await hoadonApi.getAll();
        const resNV = await StaffApi.getAll();
        const resDV = await dichVuApi.getAll();
        const resHoaDonDetails = await hoadonApi.getAllCT();

        if (resBooking.data.success) {
            //setTotalLichHen(resBooking.data.data.length);
            setbookingList(resBooking.data.data);
        }
        if (resHD.data.success) {
            //setTotalHoaDon(resHD.data.data.length);
            setHoaDonList(resHD.data.data);
        }
        if (resNV.data.success) {
            setNhanVienList(resNV.data.data);
        }
        if (resDV.data.success) {
            setDichVuList(resDV.data.data);
        }
        if (resBookingCT.data.success) {
            setbookingDetailsList(resBookingCT.data.data);
        }
        if (resHoaDonDetails.data.success) {
            setHoadonDetailsList(resHoaDonDetails.data.data);
        }

    }
    const checkOK = () => {
        //lọc
        const ltc = bookingList.filter(lh => lh.TRANGTHAI === "Hoàn thành");
        const hdtt = HoaDonList.filter(hd => hd.TRANGTHAI === "Đã thanh toán");

        setLTC(ltc.length);
        setHoaDonDTT(hdtt.length);
        //reduce duyệt
        //number tránh cộng chuỗi
        const total = hdtt.reduce((sum, hd) => sum + Number(hd.TONGTIEN), 0);
        settongDT(total);
        //console.log(total)
    }
    //lấy nhân viên xuất hiện nhiều nhất trong các lịch hẹn
    const gettopNV = () => {
        //tạo mảng
        const countNV: Record<string, number> = {};
        bookingDetailsList.forEach(lh => {
            //check true tránh underfined
            if (lh.MANV?.trim()) {
                countNV[lh.MANV.trim()] = (countNV[lh.MANV.trim()] || 0) + 1;//tìm nv nếu chưa có thì = 0, có thì + 1
            };
        });
        //console.log(countNV);
        //chuyển về ob cho dễ nhìn
        const sortNhanVien = Object.entries(countNV)
            .map(([manv, count]) => ({ manv, count }))
            //Sắp xếp giảm dần
            .sort((a, b) => b.count - a.count)
            //lấy Top 5 nhân viên xuất sắc nhất
            .slice(0, 5);
        //console.log(sortNhanVien);
        //return sortNhanVien;

        const topStaffWithDetails = sortNhanVien.map(topItem => {
            const staffDetail = NhanVienList.find(nv => nv.MANV?.trim() === topItem.manv?.trim());

            return {
                manv: topItem.manv,
                hoten: staffDetail?.HOTEN || "Không xác định",
                chucvu: staffDetail?.CHUCVU || "",
                sdt: staffDetail?.SDT || "",
                diachi: staffDetail?.DIACHI || "",
                machinhanh: staffDetail?.MACHINHANH || "",
                ngaysinh: staffDetail?.NGAYSINH || "",
                matk: staffDetail?.MATK || "",
                solich: topItem.count
            };
        });
        //console.log(topStaffWithDetails)
        setTopNV(topStaffWithDetails)
    };





    const gettopDV = () => {
        //tạo mảng
        const count: Record<string, number> = {};
        hoadonDetailsList.forEach(hd => {
            //check true tránh underfined
            if (hd.MADV?.trim()) {
                count[hd.MADV.trim()] = (count[hd.MADV.trim()] || 0) + 1;//tìm nv nếu chưa có thì = 0, có thì + 1
            };
        });
        const sortDV = Object.entries(count)
            .map(([madv, count]) => ({ madv, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topDVWithDetails = sortDV.map(topItem => {
            const DVDetail = DichVuList.find(dv => dv.MADV?.trim() === topItem.madv?.trim());

            return {
                madv: topItem.madv,
                tendv: DVDetail?.TENDV || "Dịch vụ không xác định",
                mota: DVDetail?.MOTA || "",
                thoigian: DVDetail?.THOIGIAN || 0,
                giadv: DVDetail?.GIADV || 0,
                trangthai: DVDetail?.TRANGTHAI || "",
                hinh: DVDetail?.HINH || "",
                quytrinh: DVDetail?.QUYTRINH || "",
                solan: topItem.count//gán
            };
        });
        console.log(topDVWithDetails);
        setTopDV(topDVWithDetails);
    };

    useEffect(() => {
        checkOK();
        gettopNV();
        gettopDV();
    }, [bookingList, HoaDonList, bookingDetailsList, NhanVienList, DichVuList, hoadonDetailsList]);

    //CHẠY KHI ĐC MOUNT
    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        // Gọi API lấy data thống kê
        const fetchThongKe = async () => {
            try {
                const res = await thongkeApi.thongKeDT();
                if (res && res.data && res.data.success) {
                    setDataChart(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy data thống kê", error);
            }
        };
        fetchThongKe();
        const fetchTrangThai = async () => {
            try {
                const res = await thongkeApi.getThongKeTrangThai();
                if (res && res.data && res.data.success) {
                    setDataTrangThai(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy data trạng thái", error);
            }
        };
        fetchTrangThai();
    }, []);

    // Bảng màu cho các mảnh ghép của biểu đồ
    const COLORS = ['#ef4444','#f59e0b','#10b981',   '#3b82f6', '#8b5cf6'];

    // Hàm format tiền tệ (Ví dụ: 1000000 -> 1.000.000 đ)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };


    const [formData, setFormData] = useState({
        start: '',
        end: ''
    });
    //xử lý thay đổi
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Cập nhật dữ liệu người dùng nhập vào formData
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleClickReport = async () => {
        //e.preventDefault();
        try {
            if (!formData.start || !formData.end) {
                toast.warn("Hãy chọn ngày cần xem báo cáo thống kê!");
                return;
            }
            const ngaybd = formData.start.toString();
            const ngaykt = formData.end.toString();
            //console.log(ngaybd);
            //console.log(ngaykt);
            if (ngaybd > ngaykt) {
                toast.warn("Ngày bắt đầu xem phải nhỏ hơn ngày kết thúc!");
                return;
            }
            const [resLichByNgay, resHoaDonByNgay] = await Promise.all([
                BookingApi.getByNgay(formData.start, formData.end),
                hoadonApi.getByNgay(formData.start, formData.end)
            ]);

            if (resLichByNgay.data.success && resLichByNgay.data.data) {
                setbookingList(resLichByNgay.data.data);
            } else {
                setbookingList([]); // Không có reset về rỗng
                //setTotalLichHen(0);
            }

            if (resHoaDonByNgay.data.success && resHoaDonByNgay.data.data) {
                setHoaDonList(resHoaDonByNgay.data.data);
            } else {
                setHoaDonList([]);
                //setTotalHoaDon(0);
            }

            toast.success('Xem báo cáo thành công!');
        }
        catch (error) {
            console.error("Lỗi khi xem báo cáo:", error);
            toast.error("Có lỗi xảy ra khi tải báo cáo!");
        }
    }
    const handleClickRefresh = async () => {
        setFormData({
            start: '',
            end: ''
        })
        await fetchData();
        toast.success('Làm mới thành công!');
    }
    const handleClickExcel = async () => {
        toast.info('Chức năng đang phát triển!');
    }

    const getChiNhanhName = (branchCode: string) => {
        switch (branchCode) {
            case "CN001": return "30Shine - Nguyễn Trãi";
            case "CN002": return "30Shine - Cầu Giấy";
            case "CN003": return "30Shine - Tân Bình";
            case "CN004": return "30Shine - Đà Nẵng";
            default: return "Không xác định";
        }
    };
    //css theo chi nhánh
    const branchStyles: Record<string, React.CSSProperties> = {
        "CN001": { backgroundColor: '#fff1f0', color: '#f5222d' },
        "CN002": { backgroundColor: '#e6f7ff', color: '#1890ff' },
        "CN003": { backgroundColor: '#f6ffed', color: '#52c41a' },
        "CN004": { backgroundColor: '#fff7e6', color: '#fa8c16' },
    };
    const roleStyles: Record<string, React.CSSProperties> = {
        "Admin": { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' }, // Admin
        "Quản lý": { backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }, // Quản lý
        "Stylist": { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }, // Stylist
        "Thu ngân": { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' }, // Thu ngân
        "Lễ tân": { backgroundColor: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' }, // Lễ tân
    };

    const staffColumns: Column<TopStaffData>[] = [
        { tieude: "ID", cotnhandulieu: "manv" },
        { tieude: "Họ tên", cotnhandulieu: "hoten" },
        {
            tieude: "Chức vụ", cotnhandulieu: "chucvu", render: (row) => {
                const style = roleStyles[row.chucvu || ''] || {};
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        ...style
                    }}>
                        {style ? row.chucvu : "Không xác định"}
                    </span>
                )
            }
        },
        { tieude: "Số điện thoại", cotnhandulieu: "sdt" },
        {
            tieude: "Chi nhánh", cotnhandulieu: "machinhanh", render: (row) => {
                const style = branchStyles[row.machinhanh || ''] || {};
                return (
                    <span style={style}>
                        {getChiNhanhName(row.machinhanh || '')}
                    </span>
                );
            }

        },
        {
            tieude: "Ngày sinh", cotnhandulieu: "ngaysinh", render: (row) => {
                const date = new Date(row.ngaysinh);
                return date.toLocaleDateString('vi-VN');
            }
        },
        {
            tieude: "Số lịch hẹn", cotnhandulieu: "solich", render: (row) => {
                return (
                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                        {row.solich}
                    </span>
                );
            }
        },
    ];




    //dịch vụ top
    const dichVuColumns: Column<TopDVData>[] = [
        { tieude: "ID", cotnhandulieu: "madv" },
        {
            tieude: "Ảnh", cotnhandulieu: "hinh", render: (row) => {
                const imgPath = row.hinh?.startsWith('/') ? row.hinh : `/${row.hinh}`;
                return row.hinh ? <img src={imgPath} alt={row.tendv} height="60" width="70" style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ color: '#999', fontSize: '12px' }}>Không có ảnh</span>;
            }
        },
        { tieude: "Tên dịch vụ", cotnhandulieu: "tendv" },
        { tieude: "Thời gian", cotnhandulieu: "thoigian", render: (row) => `${row.thoigian} phút` },
        {
            tieude: "Giá", cotnhandulieu: "giadv", render: (row) => {
                const value = parseFloat(row.giadv as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            }

        },
        {
            tieude: "Số lần", cotnhandulieu: "solan", render: (row) => {
                return (
                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                        {row.solan}
                    </span>
                );
            }
        },
    ];

    return (
        <>
            <div id="reports" className="section">
                <div className="panel header-actions">
                    <h2>Báo cáo thống kê</h2>
                </div>
                <div className="panel">
                    <div className="reportDate-form">
                        <div className="form-group reportDate">
                            <label>Từ ngày:</label>
                            <input value={formData.start} onChange={handleChange} type="date" id="start" />
                        </div>
                        <div className="form-group reportDate">
                            <label>Đến ngày:</label>
                            <input value={formData.end} onChange={handleChange} type="date" id="end" />
                        </div>
                        <button onClick={handleClickReport} className="btn primary">
                            <i className="fas fa-filter"></i> Xem thống kê
                        </button>
                        <button onClick={handleClickRefresh} className="btn secondary">
                            <i className="fas fa-sync"></i> Làm mới
                        </button>
                    </div>
                </div>

                <div className="cards">
                    <StatCard
                        title="Tổng Doanh Thu"
                        icon="fa-solid fa-hand-holding-dollar"
                        valueColor="#2ecc71"
                        value={tongDT.toLocaleString('vi-VN') + ' ₫'}
                    />
                    <StatCard
                        title="Tổng Lịch Hẹn"
                        icon="fas fa-calendar-check"
                        value={bookingList.length}
                        subText={"Thành công: " + lichTC}
                    />
                    <StatCard
                        title="Tổng Hoá Đơn"
                        icon="fas fa-file-invoice-dollar"
                        value={HoaDonList.length}
                        subText={"Đã thanh toán: " + HoaDonDTT}
                    />
                </div>

                {/* <div className="panel" style={{ "marginTop": "20px" }}>
                    <div className="report-filter">
                        <h3>Top Dịch Vụ hay dùng</h3>
                        <button onClick={handleClickExcel} className="btn primary">
                            <i className="fas fa-download"></i> Xuất Excel
                        </button>
                    </div>
                    <DataTable<TopDVData> columns={dichVuColumns} data={TopDV} />
                </div>
                <div className="panel" style={{ "marginTop": "20px" }}>
                    <div className="report-filter">
                        <h3>Top Nhân Viên Xuất Sắc</h3>
                        <button onClick={handleClickExcel} className="btn primary">
                            <i className="fas fa-download"></i> Xuất Excel
                        </button>
                    </div>
                    <DataTable<TopStaffData> columns={staffColumns} data={TopNV} />
                </div> */}

            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                    Biểu đồ Doanh thu năm 2026
                </h2>

                {/* Khung chứa biểu đồ (Responsive để tự co giãn) */}
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={dataChart}
                            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                            {/* Lưới nền */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />

                            {/* Trục X hiển thị tên Tháng */}
                            <XAxis dataKey="name" />

                            {/* Trục Y hiển thị Tiền */}
                            <YAxis tickFormatter={(value) => `${value / 1000000}M`} />

                            {/* Box thông tin khi trỏ chuột vào cột */}
                            <Tooltip formatter={(value: any) => formatCurrency(value)} />

                            {/* Cột hiển thị dữ liệu */}
                            <Bar
                                dataKey="DoanhThu"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]} // Bo tròn góc trên của cột
                                barSize={40} // Độ rộng của cột
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '20px' }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                    Tỉ lệ Trạng thái Lịch hẹn
                </h2>

                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            {/* Cấu hình cái bánh */}
                            <Pie
                                data={dataTrangThai}
                                cx="50%" // Căn giữa bề ngang
                                cy="50%" // Căn giữa bề dọc
                                innerRadius={80} // Tạo lỗ hổng ở giữa -> Trông như bánh Donut
                                outerRadius={120} // Độ to của bánh
                                paddingAngle={2} // Khoảng cách giữa các miếng bánh
                                dataKey="value"
                            >
                                {/* Tô màu cho từng miếng bánh */}
                                {dataTrangThai.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>

                            {/* Hover chuột vào hiện thông tin */}
                            <Tooltip />

                            {/* Chú thích các màu ở dưới đáy biểu đồ */}
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

export default ReportPage;