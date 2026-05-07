import axiosClient from './axiosClient';



const ThongKeAPI = {
    thongKeDT() {
        return axiosClient.get('/api/baocao/thongke/doanh-thu');
    },

    getThongKeTrangThai() {
        return axiosClient.get('/api/baocao/thongke/trang-thai-lich');
    },
};

export default ThongKeAPI;