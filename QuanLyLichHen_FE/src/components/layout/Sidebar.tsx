import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'; // Lấy hook ra để sử dụng trong component
const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Lấy biến user và hàm logout từ context

    const handleLogout = () => {
        const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
        if (isConfirm) {
            logout(); // Xóa sạch dữ liệu trong vùng nhớ chung
            navigate('/login', { replace: true });
        }
    }
    useEffect(() => {
        const sidebar = document.querySelector(".sidebar" as any);
        const toggleBtn = document.getElementById("toggleSidebar");

        const handleToggle = (e: MouseEvent) => {
            sidebar.classList.toggle("open");
            e.stopPropagation();
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target as Node) && e.target !== toggleBtn) {
                    sidebar.classList.remove("open");
                }
            }
        };

        const handleResize = () => {
            if (window.innerWidth > 768) sidebar.classList.remove("open");
        };

        // Gắn event
        toggleBtn?.addEventListener("click", handleToggle);
        document.addEventListener("click", handleClickOutside);
        window.addEventListener("resize", handleResize);
        // Cleanup
        return () => {
            toggleBtn?.removeEventListener("click", handleToggle);
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };

    }, []);

    const quyenHientai = Number(localStorage.getItem('phanquyen') || 0);

    const adminMenus = [
        { name: "Tổng quan", url: "/admin/dashboard", icon: "fas fa-tachometer-alt", allowedRoles: [1, 2, 3, 4, 5] },
        { name: "Tài khoản", url: "/admin/accounts", icon: "fas fa-user-shield", allowedRoles: [1] },
        { name: "Khuyến mại", url: "/admin/promotions", icon: "fas fa-tags", allowedRoles: [1] },
        { name: "Dịch vụ", url: "/admin/services", icon: "fas fa-concierge-bell", allowedRoles: [1, 2] },
        { name: "Khách hàng", url: "/admin/customers", icon: "fas fa-users", allowedRoles: [1, 2] },
        { name: "Nhân viên", url: "/admin/staff", icon: "fas fa-user-tie", allowedRoles: [1, 2] },
        { name: "Báo cáo", url: "/admin/reports", icon: "fas fa-chart-line", allowedRoles: [1, 2] },
        { name: "Lịch hẹn", url: "/admin/bookings", icon: "fas fa-calendar-check", allowedRoles: [1, 2, 3, 5] },
        { name: "Hoá đơn", url: "/admin/invoices", icon: "fas fa-file-invoice-dollar", allowedRoles: [1, 2, 4] },
    ];

    return (
        <>
            <aside className="sidebar" id="sidebar">
                <div className="brand">
                    <Link to="/admin/dashboard"><img src="/img/logoTo.png" alt="logo" /></Link>
                </div>

                <nav>
                    {/* //tạo menu admin  */}
                    {
                        adminMenus.filter(menu => menu.allowedRoles.includes(quyenHientai))
                        .map((menu, index) => (
                            <NavLink key={index} to={menu.url}>
                                <i className={menu.icon}></i> {menu.name}
                            </NavLink>
                        ))
                    }
                    {/* <NavLink to="/admin/dashboard"><i className="fas fa-tachometer-alt"></i> Tổng quan</NavLink>
                    <NavLink to="/admin/accounts"><i className="fas fa-user-shield"></i> Tài khoản</NavLink>
                    <NavLink to="/admin/promotions"><i className="fas fa-tags"></i> Khuyến mại</NavLink>
                    <NavLink to="/admin/services"><i className="fas fa-concierge-bell"></i> Dịch vụ</NavLink>
                    <NavLink to="/admin/customers"><i className="fas fa-users"></i> Khách hàng</NavLink>
                    <NavLink to="/admin/staff"><i className="fas fa-user-tie"></i> Nhân viên</NavLink>
                    <NavLink to="/admin/bookings"><i className="fas fa-calendar-check"></i> Lịch hẹn</NavLink>
                    <NavLink to="/admin/invoices"><i className="fas fa-file-invoice-dollar"></i> Hoá đơn</NavLink>
                    <NavLink to="/admin/reports"><i className="fas fa-chart-line"></i> Báo cáo</NavLink> */}
                </nav>

                <div className="accounts">
                    {user ? (<span id="login-helloADMIN-span">User: </span>) :
                        (<span id="login-helloADMIN-span">Chưa đăng nhập</span>)}

                    <strong style={{ marginLeft: '50px' }} id="login-helloADMIN"> {user ? user.username : ''}</strong>
                </div>

                <div className="sidebar-footer">
                    <button id="logoutBtn" onClick={() => { handleLogout() }}><i className="fas fa-sign-out-alt"></i> Đăng xuất</button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;