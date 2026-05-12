import axiosClient from './axiosClient';



const ThongKeAPI = {
    thongKeDT() {
        return axiosClient.get('/api/baocao/thongke/doanh-thu');
    },

    getThongKeTrangThai(ngaybd: string, ngaykt: string) {
        return axiosClient.get(`/api/baocao/thongke/trang-thai-lich?ngaybd=${ngaybd}&ngaykt=${ngaykt}`);
    },
    getThongKeGio(ngaybd: string, ngaykt: string) {
        return axiosClient.get(`/api/baocao/thongke/khung-gio?ngaybd=${ngaybd}&ngaykt=${ngaykt}`);
    },
};

export default ThongKeAPI;