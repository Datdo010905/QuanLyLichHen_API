
import StatCard from "../../components/ui/StatCard";
import React, { useEffect, useState } from "react";
import CustomerApi from "../../api/customerApi";
import BookingApi from "../../api/bookingApi";
import StaffApi from "../../api/staffApi"
import dichVuApi from "../../api/dichvuApi";
import TaiKhoanApi from "../../api/taikhoanApi";
import KhuyenMaiApi from "../../api/khuyenmaiApi";
const DashboardPage: React.FC = () => {

    //lưu state để dùng
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalNV, setTotalNV] = useState(0);
    const [totalDV, setTotalDV] = useState(0);
    const [totalTK, setTotalTK] = useState(0);
    const [totalKM, setTotalKM] = useState(0);
    const [bookingsToday, setTotalBookingsToday] = useState(0);
    const [time, setTime] = useState("");

    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    const [xinchao, setxinchao] = useState<string>("");

    const fetchData = async () => {
        const resKH = await CustomerApi.getAll();
        const resNV = await StaffApi.getAll();
        const resDV = await dichVuApi.getAll();
        const resCSD = await dichVuApi.getAllCSD();
        const resTK = await TaiKhoanApi.getAll();
        const resKM = await KhuyenMaiApi.getAll();


        if (resKH.data.success) {
            setTotalCustomers(resKH.data.data.length);
        }
        if (resKM.data.success) {
            setTotalKM(resKM.data.data.length);
        }
        if (resTK.data.success) {
            setTotalTK(resTK.data.data.length);
        }

        if (resNV.data.success) {
            setTotalNV(resNV.data.data.length);
        }
        if (resDV.data.success && resCSD.data.success) {
            setTotalDV(resDV.data.data.length + resCSD.data.data.length);
        }
        const resBooking = await BookingApi.getAll();
        if (resBooking.data.success) {
            const homnay = resBooking.data.data;
            const Todaybookings = homnay.filter(
                (lich: any) => lich.NGAYHEN.split('T')[0] === today
            );
            setTotalBookingsToday(Todaybookings.length);
        }

        if (hour < 12) {
            setxinchao("Good morning");
        }
        else if (hour < 18) {
            setxinchao("Good afternoon");
        }
        else {
            setxinchao("Good evening");
        }


    };
    // Tải dữ liệu khi component mount
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString("vi-VN"));
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    return (
        <>
            <div id="dashboard" className="section active-section">
                <div className="panel">
                    <h2>Hello! {xinchao}, bây giờ là {time}</h2>
                </div>
                <div className="cards">
                    <StatCard
                        title="Đặt lịch hôm nay"
                        icon="fas fa-calendar-check"
                        value={bookingsToday}
                        subText={`Cập nhật ngày: ${today}`}
                    />
                    <StatCard
                        title="Tổng khách"
                        icon="fas fa-users"
                        value={totalCustomers}
                    />
                    <StatCard
                        title="Tổng nhân viên"
                        icon="fas fa-user-tie"
                        value={totalNV}
                    />
                    <StatCard
                        title="Tổng dịch vụ"
                        icon="fas fa-concierge-bell"
                        value={totalDV}
                    />
                    <StatCard
                        title="Tổng khuyến mại"
                        icon="fas fa-tags"
                        value={totalKM}
                    />
                    <StatCard
                        title="Tổng người dùng"
                        icon="fas fa-user-shield"
                        value={totalTK}
                    />
                </div>


            </div>
        </>
    );
};

export default DashboardPage;