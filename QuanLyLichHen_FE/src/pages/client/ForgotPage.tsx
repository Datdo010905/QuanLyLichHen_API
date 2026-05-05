import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/login.css";
import { toast } from "react-toastify";
import TaiKhoanApi from "../../api/taikhoanApi";
const Forgot = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);//tránh đỏ màn hình khi submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !email) {
      toast.warn("Vui lòng nhập đầy đủ Số điện thoại và Email!");
      return;
    }

    try {
      // Bật trạng thái loading khi bắt đầu gọi API
      setIsLoading(true);
      const response = await TaiKhoanApi.forgotPassword({sdt: phone, email: email});

      if (response.data.success) {
        toast.success(response.data.message);
        //toast.info("Mật khẩu đã được gửi đến email của bạn.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setIsLoading(false); 
    }
  };


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
          <h1>QUÊN MẬT KHẨU</h1>

          <form onSubmit={handleSubmit}>
            <label htmlFor="Phone">
              Số điện thoại <span>*</span>
            </label>

            <input
              id="Phone"
              type="text"
              maxLength={10}
              placeholder="Nhập số điện thoại của bạn"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              required
            />

            <label htmlFor="Email">
              Email <span>*</span>
            </label>

            <input
              id="Email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* tránh spam click*/}
            <button type="submit" id="btn-login" disabled={isLoading}>
              {isLoading ? "ĐANG GỬI EMAIL..." : "GỬI YÊU CẦU"}
            </button>

            <div className="extra-links">
              <Link to="/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
