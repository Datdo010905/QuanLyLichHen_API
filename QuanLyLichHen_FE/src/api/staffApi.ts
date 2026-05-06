import axiosClient from './axiosClient';

//theo api trả về
export interface NhanVien {
    MANV: string;
    HOTEN: string;
    CHUCVU: string;
    SDT: string;
    DIACHI: string;
    MACHINHANH: string;
    NGAYSINH: string;
    MATK: string;
};

export interface TopStaffData {
    manv: string;
    hoten: string;
    chucvu: string;
    sdt: string;
    diachi: string;
    machinhanh: string;
    ngaysinh: string;
    matk: string;
    solich: number;
}

const NhanVienApi = {
    getAll() {
        return axiosClient.get('/api/nhanvien/get-all-nhanvien');
    },
    getById(id: string) {
        return axiosClient.get(`/api/nhanvien/get-byId-nhanvien/${id}`);
    },
    create(data: NhanVien) {
        return axiosClient.post('/api/nhanvien/insert-nhanvien', data);
    },
    update(id: string, data: NhanVien) {
        return axiosClient.put(`/api/nhanvien/update-nhanvien/${id}`, data);
    },
    delete(id: string) {
        return axiosClient.delete(`/api/nhanvien/delete-nhanvien/${id}`);
    },


    //any vì có cả data tài khoản
    createFull(data: any) {
        return axiosClient.post('/api/nhanvien/insert-full', data);
    },
    deleteFull(id: string) {
        return axiosClient.delete(`/api/nhanvien/delete-full/${id}`);
    },
};


export default NhanVienApi;