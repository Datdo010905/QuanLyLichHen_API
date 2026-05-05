
import axiosClient from './axiosClient';

export interface LoginPayload {
  username: string;
  password: string;
}
export interface SignupPayload {
  username: string;
  password: string;
}
// Định nghĩa kiểu dữ liệu API trả về khi thành công
//VIẾT HOA CHO GIỐNG PRISMA
export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    MATK: string;
    PASS: string;
    PHANQUYEN: number;
    TRANGTHAI: string;
  };
}
const authApi = {
  login(data: LoginPayload) {
    //const url = '/api-common/Login_/login-taikhoan';
    const url = '/api/login/login-taikhoan';
    // Truyền interface vào để TypeScript biết response trả về có cấu trúc như thế nào
    return axiosClient.post<LoginResponse>(url, {
      username: data.username,
      pass: data.password 
    });
  },
};

export default authApi;