import React, { useState } from "react";
import "../../assets/css/login.css";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi"; // Đảm bảo bạn có hàm signup trong authApi
import { toast } from "react-toastify";
import customerApi from "../../api/customerApi";

const Signup = () => {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const [email, setEmail] = useState("");

    const [showPwd, setShowPwd] = useState(false);
    const [showRePwd, setShowRePwd] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Thêm state loading

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== rePassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            //TAIKHOAN
            // const submitData = new FormData();
            // submitData.append('MaTK', username);
            // submitData.append('Pass', password);
            // submitData.append('TrangThai', 'Hoạt động');
            // submitData.append('phanQuyen', '0');

            //KHACHHANG
            // const submitDataKH = new FormData();
            // submitDataKH.append('MaKH', username);
            // submitDataKH.append('HoTen', fullName);
            // submitDataKH.append('SDT', username);
            // submitDataKH.append('MaTK', username);

            const combinedData = {
                MATK: username,
                PASS: password,
                PHANQUYEN: 0,
                TRANGTHAI: "Hoạt động",
                HOTEN: fullName,
                SDT: username,
                EMAIL: email
            };

            await customerApi.create(combinedData);
            toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            navigate('/login');

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Đăng ký tài khoản thất bại!");
            console.error('Lỗi đăng ký:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const onlyNumber = (value: string) => value.replace(/[^0-9]/g, "");

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <Link to="/">
                        <img src="/img/logoTo.png" alt="30Shine Logo" className="logo" />
                    </Link>
                    <h2>30Shine - Cắt tóc theo phong cách của bạn!</h2>
                </div>

                <div className="login-right">
                    <h1>ĐĂNG KÝ TÀI KHOẢN</h1>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="fullname">
                            Họ và tên <span>*</span>
                        </label>
                        <input
                            id="fullname"
                            type="text"
                            placeholder="Nhập họ và tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <label htmlFor="username">
                            Số điện thoại <span>*</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={username}
                            maxLength={10}
                            onChange={(e) => setUsername(onlyNumber(e.target.value))}
                            required
                        />

                        <label htmlFor="email">
                            Email <span>*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Nhập email phục vụ việc quên mật khẩu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="password">
                            Mật khẩu <span>*</span>
                        </label>
                        <div className="password-container">
                            <input
                                id="password"
                                type={showPwd ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`fa ${showPwd ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setShowPwd(!showPwd)}
                                style={{ cursor: "pointer" }}
                            ></i>
                        </div>

                        <label htmlFor="repassword">
                            Nhập lại mật khẩu <span>*</span>
                        </label>
                        <div className="password-container">
                            <input
                                id="repassword"
                                type={showRePwd ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                                required
                            />
                            <i
                                className={`fa ${showRePwd ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setShowRePwd(!showRePwd)}
                                style={{ cursor: "pointer" }}
                            ></i>
                        </div>

                        <button type="submit" id="btn-login" disabled={isLoading}>
                            {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                        </button>

                        <div className="extra-links">
                            <Link to="/login">Đã có tài khoản? Đăng nhập ngay</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;