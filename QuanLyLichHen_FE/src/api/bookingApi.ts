import axiosClient from './axiosClient';

export interface Booking {
    MALICH: string;
    NGAYHEN: string;
    GIOHEN: string;
    TRANGTHAI: string;
    MACHINHANH: string;
    MAKH: string;
}
export interface BookingDetails {
    MALICH: string;
    MADV: string;
    MANV: string;
    SOLUONG: number;
    GIA_DUKIEN: number;
    GHICHU: string;
}

const BookingApi = {
    // ===== LỊCH HẸN =====
    getAll() {
        return axiosClient.get('/api/lichhen/get-all-lichhen');
    },

    getById(id: string) {
        return axiosClient.get(`/api/lichhen/get-byId-lichhen/${id}`);
    },

    getAllByIdKH(id: string) {
        return axiosClient.get(`/api/lichhen/get-byIdKH-lichhen/${id}`);
    },
    create(data: Booking) {
        return axiosClient.post('/api/lichhen/insert-lichhen', data);
    },

    update(id: string, trangthai: string) {
        return axiosClient.put(`/api/lichhen/update-lichhen/${id}`, {
            TRANGTHAI: trangthai
        });
    },

    delete(id: string) {
        return axiosClient.delete(`/api/lichhen/delete-lichhen/${id}`);
    },
    getByNgay(ngaybd: string, ngaykt: string) {
        const url = `/api/lichhen/get-all-lichhenTheoNgay?ngaybd=${ngaybd}&ngaykt=${ngaykt}`;
        return axiosClient.get(url);
    },
    // ===== CHI TIẾT LỊCH HẸN =====
    getAllCT() {
        return axiosClient.get('/api/lichhen/get-all-CTlichhen');
    },

    getByIdCT(id: string) {
        return axiosClient.get(`/api/lichhen/get-byId-CTlichhen/${id}`);
    },

    createCT(data: BookingDetails) {
        return axiosClient.post('/api/lichhen/insert-CTlichhen', data);
    },
    updateCT(id: string, ghichu: string) {
        return axiosClient.put(`/api/lichhen/update-CTlichhen/${id}`, { GHICHU: ghichu });
    },
    deleteCT(id: string) {
        return axiosClient.delete(`/api/lichhen/delete-CTlichhen/${id}`);
    },

    createFull: (data: { booking: Booking, details: BookingDetails }) => {
        return axiosClient.post('/api/lichhen/create-full', data); 
    },

    deleteFull: (id: string) => {
        return axiosClient.delete(`/api/lichhen/delete-full/${id}`);
    },
};
export default BookingApi;