import axiosClient from './axiosClient';

//định nghĩa theo api trả về
export interface TaiKhoan {
    MATK: string;
    PASS: string;
    PHANQUYEN: number;
    TRANGTHAI: string;
};

const TaiKhoanApi = {
    // Lấy tất cả
    getAll() {
        const url = '/api/taikhoan/get-all-taikhoan';
        return axiosClient.get(url);
    },

    // Lấy theo ID
    getById(id: string) {
        const url = `/api/taikhoan/get-byId-taikhoan/${id}`;
        return axiosClient.get(url);
    },

    // Thêm mới (Gửi JSON)
    create(data: TaiKhoan) {
        const url = '/api/taikhoan/insert-taikhoan';
        return axiosClient.post(url, data);
    },

    // Cập nhật (Gửi JSON + ID trên URL)
    update(id: string, data: TaiKhoan) {
        const url = `/api/taikhoan/update-taikhoan/${id}`;
        return axiosClient.put(url, data);
    },

    // Xóa
    delete(id: string) {
        const url = `/api/taikhoan/delete-taikhoan/${id}`;
        return axiosClient.delete(url);
    },

    //quên mật khẩu
    forgotPassword(data: { sdt: string; email: string }) {
        const url = '/api/taikhoan/forgot-password';
        return axiosClient.post(url, data);
    }

};

export default TaiKhoanApi;