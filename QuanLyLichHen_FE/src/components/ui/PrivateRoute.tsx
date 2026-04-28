import React, { use, useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


// Định nghĩa prop để nhận vào danh sách các quyền hợp lệ
interface PrivateRouteProps {
  allowedRoles?: number[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('phanquyen'); // Lấy quyền đang lưu
  const navigate = useNavigate();

  //chặn việc render giao diện khi chưa check xong quyền
  const [isAuthorized, setIsAuthorized] = useState(false);


  // Kiểm tra xem người dùng có token và quyền hợp lệ không
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
    if (allowedRoles && role && !allowedRoles.includes(Number(role))) {
      toast.error("Bạn không có quyền truy cập trang này!", {
        toastId: "loi-vuot-quyen"
      });
      navigate('/', { replace: true });
    } else {
      setIsAuthorized(true);
    }
  }, [token, role, allowedRoles, navigate]);


  if (!isAuthorized) {
    return null;
  }

  //đúng
  return <Outlet />;
};

export default PrivateRoute;