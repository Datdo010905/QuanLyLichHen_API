import axiosClient from './axiosClient';

export interface Customer {
    MAKH: string;
    HOTEN: string;
    SDT: string;
    MATK: string;
    EMAIL: string;
};

const CustomerApi = {
    getAll() {
        return axiosClient.get('/api/khachhang/get-all-khachhang');
    },
    getById(id: string) {
        return axiosClient.get(`/api/khachhang/get-byId-khachhang/${id}`);
    },
    //any vì có cả data tài khoản
    create(data: any) {
        return axiosClient.post('/api/khachhang/insert-khachhangVoiTaiKhoan', data);
    },
    update(id: string, data: Customer) {
        return axiosClient.put(`/api/khachhang/update-khachhang/${id}`, data);
    },
    delete(id: string) {
        return axiosClient.delete(`/api/khachhang/delete-khachhang/${id}`);
    },

    deleteFull(id: string) {
        return axiosClient.delete(`/api/khachhang/delete-full/${id}`);
    },
    //? cho phép null
    updateProfileFull: (id: string, data: { customerData: any, accountData?: any }) => {
        return axiosClient.put(`/api/khachhang/update-profile/${id}`, data);
    },
};
export default CustomerApi;