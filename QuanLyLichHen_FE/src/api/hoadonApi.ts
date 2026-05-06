import axiosClient from './axiosClient';

export interface HoaDon {
    MAHD: string;
    MAKH: string;
    MAKM: string;
    MALICH: string;
    MANV: string;
    TONGTIEN: number;
    HINHTHUCTHANHTOAN: string;
    TRANGTHAI: string;
    NGAYTHANHTOAN: string;
}
export interface HoaDonDetails {
    MAHD: string;
    MADV: string;
    SOLUONG: number;
    DONGIA: number;
    THANHTIEN: string;
}

const HoaDonApi = {
    // ===== HÓA ĐƠN =====
    getAll() {
        return axiosClient.get('/api/hoadon/get-all-HoaDon');
    },

    getById(id: string) {
        return axiosClient.get(`/api/hoadon/get-byId-HoaDon/${id}`);
    },

    create(data: HoaDon) {
        return axiosClient.post('/api/hoadon/insert-HoaDon', data);
    },

    update(id: string, data: HoaDon) {
        return axiosClient.put(`/api/hoadon/update-HoaDon/${id}`, data);
    },

    delete(id: string) {
        return axiosClient.delete(`/api/hoadon/delete-HoaDon/${id}`);
    },
    getByNgay(ngaybd: string, ngaykt: string) {
        // Đổi api-admin thành chuẩn api anh em mình chốt
        const url = `/api/hoadon/get-all-hoadonTheoNgay?ngaybd=${ngaybd}&ngaykt=${ngaykt}`;
        return axiosClient.get(url);
    },
    // ===== CHI TIẾT HÓA ĐƠN =====
    getAllCT() {
        return axiosClient.get('/api/hoadon/get-all-CTHoaDon');
    },

    getByIdCT(id: string) {
        return axiosClient.get(`/api/hoadon/get-byId-CTHoaDon/${id}`);
    },

    createCT(data: HoaDonDetails) {
        return axiosClient.post('/api/hoadon/insert-CTHoaDon', data);
    },

    deleteCT(id: string) {
        return axiosClient.delete(`/api/hoadon/delete-CTHoaDon/${id}`);
    },


    checkout: (data: { invoice: HoaDon, details: HoaDonDetails[] }) => {
        return axiosClient.post('/api/hoadon/insert-HoaDonvaChiTiet', data);
    },
    deleteFull: (id: string) => {
        return axiosClient.delete(`/api/hoadon/delete-HoaDonvaChiTiet/${id}`);
    },
};
export default HoaDonApi;