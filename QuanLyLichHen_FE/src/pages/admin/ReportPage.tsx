
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
import { AreaChart, Area } from 'recharts';
import { exportToExcel } from "../../utils/excelUtils";

const ReportPage = () => {

    // const [totalLichHen, setTotalLichHen] = useState(0);
    // const [totalHoaDon, setTotalHoaDon] = useState(0);

    const [dataChart, setDataChart] = useState([]);
    const [dataTrangThai, setDataTrangThai] = useState([]);
    const [dataKhungGio, setDataKhungGio] = useState<any[]>([]);

    const [bookingList, setbookingList] = useState<Booking[]>([]);
    const [bookingDetailsList, setbookingDetailsList] = useState<BookingDetails[]>([]);

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
        // Gọi API lấy data thống kê
        const fetchTrangThai = async () => {
            try {
                const res = await thongkeApi.getThongKeTrangThai('2026-01-01', '2026-12-31');
                if (res && res.data && res.data.success) {
                    setDataTrangThai(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy data thống kê", error);
            }
        };
        fetchTrangThai();

        // Gọi API lấy data thống kê
        const fetchGio = async () => {
            try {
                const res = await thongkeApi.getThongKeGio('2026-01-01', '2026-12-31');
                if (res && res.data && res.data.success) {
                    setDataKhungGio(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy data thống kê", error);
            }
        };
        fetchGio();
    }, []);

    // Định nghĩa màu cố định cho từng trạng thái
    const STATUS_COLOR_MAP: Record<string, string> = {
        'Hoàn thành': '#10b981',
        'Đã huỷ': '#ef4444',
        'Đang chờ': '#722ed1',
        'Đang thực hiện': '#fa8c16',
        'Đã đặt': '#1890ff',
        'Chưa xác định': '#94a3b8'
    };

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
            //trạng thái
            const res = await thongkeApi.getThongKeTrangThai(formData.start, formData.end);
            if (res && res.data && res.data.success) {
                setDataTrangThai(res.data.data);
            }

            //khung giờ
            const resKhungGio = await thongkeApi.getThongKeGio(formData.start, formData.end);
            if (resKhungGio.data?.success) {
                setDataKhungGio(resKhungGio.data.data);
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



    const handleClickExcelDichVu = async () => {
        //toast.info('Chức năng đang phát triển!');
        //đổi tên cột sang tiếng Việt
        const dataExport = TopDV.map((item, index) => ({
            "STT": index + 1,
            "Tên Dịch Vụ": item.tendv,
            "Thời gian": item.thoigian,
            "Giá (VNĐ)": item.giadv,
            "Số Lần Dùng": item.solan
        }));

        exportToExcel(dataExport, "Bao_Cao_Top_Dich_Vu", "DichVu");
    }


    const handleClickExcelNhanVien = async () => {
        //toast.info('Chức năng đang phát triển!');
        const dataExport = TopNV.map((item, index) => ({
            "STT": index + 1,
            "Tên Nhân Viên": item.hoten,
            "Số Lịch Hẹn": item.solich,
        }));

        exportToExcel(dataExport, "Bao_Cao_Nhan_Vien_Xuat_Sac", "NhanVien");
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
                const style = branchStyles[row.machinhanh?.trim() || ''] || {};
                return (
                    <span style={style}>
                        {getChiNhanhName(row.machinhanh?.trim() || '')}
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

                {/* ===== BỐ CỤC CHIA 2 CỘT CHO BIỂU ĐỒ ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

                    {/* --- CỘT 1: BIỂU ĐỒ DOANH THU --- */}
                    <div className="panel" style={{ margin: 0, padding: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            Doanh thu năm 2026
                        </h2>

                        <div style={{ width: '100%', height: 350 }}>
                            {/* giúp chart tự do co giãn */}
                            <ResponsiveContainer>
                                <BarChart
                                    data={dataChart}
                                    margin={{ top: 20, right: 40, left: 0, bottom: 5 }}
                                >
                                    {/* lưới nền nét đứt và tắt cho trục Y */}
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={1} />
                                    {/* data trục ngang */}
                                    <XAxis dataKey="name" stroke="#a0aec0" />
                                    {/* format số hiển thị */}
                                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} stroke="#a0aec0" />

                                    {/* Hiện popup khi hover chuột */}
                                    <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Bar
                                        dataKey="DoanhThu"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}//độ rộng cột
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- CỘT 2: BIỂU ĐỒ TRẠNG THÁI --- */}
                    <div className="panel" style={{ margin: 0, padding: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            Tỉ lệ trạng thái lịch hẹn
                        </h2>

                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={dataTrangThai}
                                        cx="50%"//Vị trí tâm biểu đồ. ngang giữa
                                        cy="50%"//dọc giữa
                                        innerRadius={80}//bán kính bên trong
                                        outerRadius={120}//bán kính ngooài
                                        paddingAngle={2}//Khoảng cách giữa các miếng chart.
                                        dataKey="value"//lấy data
                                    >
                                        {/* tô màu */}
                                        {dataTrangThai.map((entry: any, index) => {
                                            const fillColor = STATUS_COLOR_MAP[entry.name] || STATUS_COLOR_MAP['Chưa xác định'];
                                            return (
                                                <Cell key={`cell-${index}`} fill={fillColor} />//tô màu cho từng miếng
                                            );
                                        })}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    {/* ghi chú */}
                                    <Legend verticalAlign="middle" layout="vertical" align="right" wrapperStyle={{ right: 20, top: '30%' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* ===== BÁO CÁO KHUNG GIỜ VÀNG */}
                <div className="panel" style={{ marginTop: '20px', padding: '20px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Khung giờ vàng
                    </h2>


                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart
                                data={dataKhungGio}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                {/* defs custom màu*/}
                                <defs>
                                    {/* dải màu đậm rồi nhạt từ trên xuống dưới */}
                                    <linearGradient id="colorKhungGio" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <XAxis dataKey="time" stroke="#a0aec0" />
                                {/* ko cho số thập phân */}
                                <YAxis stroke="#a0aec0" allowDecimals={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={1} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#c4b5fd' }}
                                />

                                {/* Cấu hình đổ bóng cho vùng dữ liệu (Area)  */}
                                <Area
                                    type="monotone" // Làm nét vẽ uốn lượn
                                    dataKey="soLuong"
                                    name="Lượt khách hàng"
                                    stroke="#8b5cf6" // Màu nét đứt viền trên cùng
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorKhungGio)"//dùng màu đã cus
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="panel" style={{ "marginTop": "20px" }}>
                    <div className="report-filter">
                        <h3>Top Dịch Vụ hay dùng</h3>
                        <button onClick={handleClickExcelDichVu} className="btn primary">
                            <i className="fas fa-download"></i> Xuất Excel
                        </button>
                    </div>
                    <DataTable<TopDVData> columns={dichVuColumns} data={TopDV} />
                </div>
                <div className="panel" style={{ "marginTop": "20px" }}>
                    <div className="report-filter">
                        <h3>Top Nhân Viên Xuất Sắc</h3>
                        <button onClick={handleClickExcelNhanVien} className="btn primary">
                            <i className="fas fa-download"></i> Xuất Excel
                        </button>
                    </div>
                    <DataTable<TopStaffData> columns={staffColumns} data={TopNV} />
                </div>

            </div>

        </>
    );
};

export default ReportPage;