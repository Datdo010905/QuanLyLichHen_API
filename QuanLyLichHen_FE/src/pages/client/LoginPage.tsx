import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/login.css";
import authApi, { LoginPayload } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // Thêm state để lưu giá trị input
  const [password, setPassword] = useState(""); // Thêm state để lưu giá trị input

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuth(); // Lấy hàm login và logout từ context


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: LoginPayload = { username, password };
      const response = await authApi.login(payload);

      if (response.data.success) {
        const token = response.data.token;
        const phanquyen = response.data.data.PHANQUYEN;
        const username = response.data.data.MATK;
        const trangthai = response.data.data.TRANGTHAI;

        // GỌI HÀM LƯU VÀO VÙNG NHỚ CHUNG TẠI ĐÂY
        login({ username, role: phanquyen.toString() }, token);
        if (trangthai === "Hoạt động") {
          if (phanquyen === 1 || phanquyen === 2 || phanquyen === 3 || phanquyen === 4 || phanquyen === 5) {
            navigate('/admin/dashboard');
            toast.success('Đăng nhập thành công! Chào mừng bạn đến với trang quản trị.');
          }
          else if (phanquyen === 0) {
            navigate('/home');
            toast.success('Đăng nhập thành công! Chào mừng bạn đến với trang chủ.');
          }
          else {
            toast.error('Quyền truy cập không hợp lệ. Vui lòng liên hệ quản trị viên.');
            logout(); // Đảm bảo xóa dữ liệu nếu quyền không hợp lệ
          };
        }
        else{
          toast.error('Tài khoản đã bị khoá! Không thể truy cập.');
          logout(); // Đảm bảo xóa dữ liệu nếu tài khoản bị khoá
        }
      }
      else {
        //sai username hoặc password
        toast.error(response.data.message);
      }

    }
    catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } 
      else {
        toast.error('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
      console.error('Lỗi đăng nhập:', err);
    } finally {
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
          <h1>ĐĂNG NHẬP</h1>

          {error && (
            <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <label htmlFor="username">
              Tài khoản <span>*</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="Số điện thoại"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">
              Mật khẩu <span>*</span>
            </label>

            <div className="password-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>

            <div className="extra-links">
              <Link to="/forgot">Quên mật khẩu?</Link> |{" "}
              <Link to="/signup">Đăng ký ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
