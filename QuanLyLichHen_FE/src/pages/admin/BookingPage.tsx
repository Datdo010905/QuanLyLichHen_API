import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../components/ui/Modal";
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import bookingApi, { Booking, BookingDetails } from "../../api/bookingApi";
import { BookingSchema } from "../../utils/bookingSchema";
import customerApi, { Customer } from "../../api/customerApi";
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import staffApi, { NhanVien } from "../../api/staffApi";

const BookingPage = () => {
    //khởi tạo state
    //Gộp state
    const [modalType, setModalType] = useState<'add' | 'addDetails' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa
    const [IDtoView, setIDtoView] = useState<string | null>(null); // Lưu ID cần xem chi tiết
    const [viewDetailsList, setViewDetailsList] = useState<BookingDetails[]>([]);

    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();


    const quyenHientai = localStorage.getItem('phanquyen') || 0;

    //Dữ liệu
    const [bookingList, setBookingList] = useState<Booking[]>([]);
    const [bookingDetailsList, setBookingDetailsList] = useState<BookingDetails[]>([]); // Dữ liệu chi tiết lịch hẹn để hiển thị khi xem chi tiết
    const [customerList, setCustomerList] = useState<Customer[]>([]); // Dữ liệu khách hàng để đổ vào select
    const [dichVuList, setDichVuList] = useState<DichVu[]>([]); // Dữ liệu dịch vụ để đổ vào select
    const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]); // Dữ liệu nhân viên để đổ vào select

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        bookingID: '',
        customerID: '',
        branchID: '',
        bookingDate: '',
        bookingTime: '',
        status: '',
        dichvu: '',
        soluong: '',
        nhanvien: '',
    });

    const [formDataDetails, setFormDataDetails] = useState({
        bookingID: '',
        branchID: '',
        dichvu: '',
        soluong: '',
        giadukien: '',
        nhanvien: '',
        ghichu: '',
    });

    const [formDataTK, setFormDataTK] = useState({
        start: '',
        end: ''
    });

    const filteredBookingList = bookingList.filter(lichhen =>
        lichhen.MALICH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lichhen.MAKH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lichhen.MACHINHANH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lichhen.NGAYHEN
            ? new Date(lichhen.NGAYHEN).toLocaleDateString('vi-VN').includes(searchTerm)
            : false)
    );
    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resBooking = await bookingApi.getAll();
            const resCustomer = await customerApi.getAll();
            const resDichVu = await dichVuApi.getAll();
            const resNhanVien = await staffApi.getAll();

            const resBookingDetails = await bookingApi.getAllCT();

            if (resCustomer.data.success) {
                setCustomerList(resCustomer.data.data);
            }
            if (resDichVu.data.success) {
                setDichVuList(resDichVu.data.data);
            }
            if (resNhanVien.data.success) {
                setNhanVienList(resNhanVien.data.data);
            }
            if (resBookingDetails.data.success) {
                setBookingDetailsList(resBookingDetails.data.data);
            }


            setBookingList(resBooking.data.data);
        } catch (err) {
            setError("Không thể tải dữ liệu từ máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };
    // Tải dữ liệu khi component mount
    useEffect(() => {
        fetchData();
    }, []);


    // Chuẩn bị form rỗng khi Thêm 
    const handleOpenAdd = () => {
        setFormData({
            bookingID: '',
            customerID: '',
            branchID: '',
            bookingDate: '',
            bookingTime: '',
            status: 'Đã đặt', // Mặc định là "Đã đặt" khi tạo mới
            dichvu: '',
            soluong: '',
            nhanvien: '',
        });
        setFormDataDetails({
            bookingID: '',
            branchID: '',
            dichvu: '',
            soluong: '1',
            giadukien: '',
            nhanvien: '',
            ghichu: '',
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };
    //lấy mã lịch và mã chi nhánh của lịch được click để chuẩn bị form thêm chi tiết
    const handleAddDetailsClick = (row: Booking) => {
        setFormData({
            bookingID: row.MALICH?.trim() || '',
            customerID: row.MAKH?.trim() || '',
            branchID: row.MACHINHANH?.trim() || '',
            bookingDate: row.NGAYHEN ? row.NGAYHEN.split('T')[0] : '',
            bookingTime: row.GIOHEN?.trim() || '',
            status: row.TRANGTHAI?.trim() || '',
            dichvu: '',
            soluong: '1',
            nhanvien: '',
        });

        setFormDataDetails({
            bookingID: row.MALICH?.trim() || '',
            branchID: row.MACHINHANH?.trim() || '',
            dichvu: '',
            soluong: '1',
            giadukien: '',
            nhanvien: '',
            ghichu: '',
        });
        setFormErrors({});
        setModalType('addDetails');
    };
    //click nút sửa
    const handleEditClick = (row: Booking) => {
        setFormData({
            bookingID: row.MALICH.trim() || '',
            customerID: row.MAKH.trim() || '',
            branchID: row.MACHINHANH.trim() || '',
            bookingTime: row.GIOHEN.trim() || '',
            bookingDate: row.NGAYHEN ? row.NGAYHEN.split('T')[0] : '',
            status: row.TRANGTHAI.trim() || '',
            dichvu: '', //tạm để trống
            soluong: '', //tạm để trống
            nhanvien: '' //tạm để trống
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('edit');
    };


    //xử lý thay đổi form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Cập nhật dữ liệu người dùng nhập vào formData
        setFormData((prev) => ({ ...prev, [id]: value }));
        setFormDataTK((prev) => ({ ...prev, [id]: value }));

        //Tự động xóa lỗi của chính field đang được gõ
        if (formErrors[id]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[id]; // Xóa thông báo lỗi của field này
                return newErrors;
            });
        }
    };

    const handleDeleteClick = (row: Booking) => {
        setIdToDelete(row.MALICH || null);
        setIsDeleteModalOpen(true);
    };

    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        //có lỗi
        if (modalType === 'add') {
            // Kiểm tra toàn bộ dữ liệu với Zod khi thêm mới
            const validationResult = BookingSchema.safeParse(formData);

            if (!validationResult.success) {
                const fieldErrors = validationResult.error.flatten().fieldErrors;
                const newErrors: Record<string, string> = {};

                for (const key in fieldErrors) {
                    newErrors[key] = fieldErrors[key as keyof typeof fieldErrors]?.[0] || '';
                }

                setFormErrors(newErrors);
                return;
            }
        } else if (modalType === 'edit') {
            if (!formData.status) {
                setFormErrors({ trangthai: "Trạng thái không được để trống" });
                return;
            }
        }
        //hợp lệ
        setFormErrors({});

        //tạo FormData theo swagger
        // const submitData = new FormData();
        // submitData.append('MaLich', formData.bookingID);
        // submitData.append('NgayHen', formData.bookingDate);
        // submitData.append('GioHen', formData.bookingTime);
        // submitData.append('TrangThai', formData.status);
        // submitData.append('MaChiNhanh', formData.branchID);
        // submitData.append('MaKH', formData.customerID);

        // const submitDataCT = new FormData();
        // submitDataCT.append('MaLich', formData.bookingID);
        // submitDataCT.append('MaDV', formData.dichvu);
        // submitDataCT.append('MaNV', formData.nhanvien);
        // submitDataCT.append('SoLuong', formData.soluong);
        // const dichVuSelected = dichVuList.find(dv => dv.madv === formData.dichvu);
        // submitDataCT.append('GiaDuKien', dichVuSelected ? dichVuSelected.giadv.toString() : '0');
        // submitDataCT.append('GhiChu', formDataDetails.ghichu || 'Không có ghi chú');

        // TẠO JSON CHO BẢNG (LỊCH HẸN)
        const submitData: Booking = {
            MALICH: formData.bookingID,
            NGAYHEN: formData.bookingDate,
            GIOHEN: formData.bookingTime,
            TRANGTHAI: formData.status,
            MACHINHANH: formData.branchID,
            MAKH: formData.customerID
        };
        // Tìm dịch vụ để lấy giá dự kiến
        const dichVuSelected = dichVuList.find(dv => (dv.MADV?.trim()) === formData.dichvu?.trim());

        // TẠO JSON CHO BẢNG (CHI TIẾT LỊCH HẸN)
        const submitDataCT: BookingDetails = {
            MALICH: formData.bookingID,
            MADV: formData.dichvu?.trim(),
            MANV: formData.nhanvien?.trim(),
            SOLUONG: Number(formData.soluong),
            GIA_DUKIEN: dichVuSelected ? Number(dichVuSelected.GIADV) : 0,
            GHICHU: formDataDetails.ghichu || 'Không có ghi chú'
        };



        //khởi tạo bên ngoài để dùng chung cho các trường hợp
        const trangthaiHienTai = bookingList.find(b => b.MALICH?.trim() === formData.bookingID)?.TRANGTHAI;
        const trangthaiMoi = formData.status?.trim();
        try {

            if (modalType === 'add') {

                // Check 404 cho hàm kiểm tra tồn tại
                let isExist = false;
                try {
                    const checkExist = await bookingApi.getById(formData.bookingID);
                    if (checkExist && checkExist.data.success)
                        isExist = true;
                } catch (err: any) {
                    if (err.response && err.response.status === 404)
                        isExist = false;
                    else throw err;
                }

                if (isExist) {
                    toast.error("Mã lịch hẹn đã tồn tại!");
                    return;
                }
                await bookingApi.create(submitData);
                await bookingApi.createCT(submitDataCT);
                toast.success("Thêm lịch hẹn thành công!");

            }
            else if (modalType === 'edit') {
                //check quy trình của 5 trạng thái
                //1. Đã đặt -> Đang chờ -> Đang thực hiện -> Hoàn thành
                //2. Đã đặt -> Đã huỷ 
                //3. Đang chờ -> Đã huỷ       
                if (trangthaiHienTai === "Đã huỷ" || trangthaiHienTai === "Hoàn thành") {
                    toast.error("Lịch hẹn đã " + trangthaiHienTai + ", không thể thay đổi trạng thái nữa!");
                    return;
                }
                if (trangthaiHienTai === "Đã đặt" && trangthaiMoi !== "Đang chờ" && trangthaiMoi !== "Đã huỷ") {
                    toast.error("Trạng thái phải theo quy trình: Đã đặt -> Đang chờ trước khi chuyển sang trạng thái khác hoặc -> Đã huỷ");
                    return;
                }
                if (trangthaiHienTai === "Đang chờ" && trangthaiMoi !== "Đang thực hiện" && trangthaiMoi !== "Đã huỷ") {
                    toast.error("Trạng thái phải theo quy trình: Đã đặt -> Đang chờ -> Đang thực hiện hoặc -> Đã huỷ");
                    return;
                }
                if (trangthaiHienTai === "Đang thực hiện" && trangthaiMoi !== "Hoàn thành") {
                    toast.error("Trạng thái phải theo quy trình: Đang thực hiện -> Hoàn thành");
                    return;
                }

                await bookingApi.update(formData.bookingID, formData.status);
                toast.success("Cập nhật lịch hẹn thành công!");
            }
            else {
                if (trangthaiHienTai !== "Đã đặt" && trangthaiHienTai !== "Đang chờ") {
                    toast.error("Chỉ có thể thêm chi tiết cho lịch hẹn ở trạng thái Đã đặt hoặc Đang chờ!");
                    return;
                }

                if (!formData.dichvu || !formData.soluong || !formData.nhanvien) {
                    toast.error("Dịch vụ, số lượng và nhân viên không được để trống!");
                    return;
                }
                await bookingApi.createCT(submitDataCT);
                toast.success("Thêm chi tiết lịch hẹn thành công!");
            }
            setModalType('none'); // Đóng form
            fetchData(); // Tải lại dữ liệu
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Thao tác thất bại, vui lòng kiểm tra lại!");

        }
    };
    // xoá
    const handleDeleteConfirm = async () => {
        if (!idToDelete) return;
        if (quyenHientai !== '1' && quyenHientai !== '2') {
            toast.error("Bạn không có quyền xóa lịch hẹn!");
            return;
        }
        
        try {
            //chỉ xoá những lịch đã huỷ
            const lichHen = bookingList.find(b => b.MALICH?.trim() === idToDelete?.trim());
            
            if (lichHen?.TRANGTHAI?.trim() !== "Đã huỷ") {
                toast.error("Chỉ có thể xóa những lịch hẹn đã huỷ!");
                return;
            }
            try {
                await bookingApi.deleteCT(idToDelete.trim());
            }
            catch (error) {
                console.error("Lỗi xóa chi tiết:", error);
            }

            await bookingApi.delete(idToDelete.trim());

            toast.success("Xóa lịch hẹn thành công!");
            setIsDeleteModalOpen(false);
            fetchData(); // Load lại bảng
            if (idToDelete === IDtoView) {
                setIDtoView(null);
                setViewDetailsList([]);
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
            toast.error("Xóa thất bại!");
        }
    };
    const handleViewClick = async (row: Booking) => {
        try {
            setIDtoView(row.MALICH || null);

            const view = await bookingApi.getByIdCT(row.MALICH || '');
            if (view.data.success) {
                const responseData = view.data.data;
                // Nếu là mảng thì giữ nguyên, không thì bọc []
                const formattedData = Array.isArray(responseData) ? responseData : [responseData];

                setViewDetailsList(formattedData);
                //toast.info(`Xem chi tiết lịch hẹn: ${row.MALICH}`);

            } else {
                toast.error("Không tìm thấy chi tiết lịch hẹn!");
                setViewDetailsList([]); // Xóa rỗng bảng nếu không có data
            }
        } catch (error) {
            console.error("Lỗi xem chi tiết:", error);
            toast.error("Xem chi tiết thất bại!");
            setViewDetailsList([]); // Xóa rỗng bảng nếu không có data
        }
    };
    const getChiNhanhName = (branchCode: string) => {
        switch (branchCode?.trim()) {
            case "CN001": return "30Shine - Nguyễn Trãi";
            case "CN002": return "30Shine - Cầu Giấy";
            case "CN003": return "30Shine - Tân Bình";
            case "CN004": return "30Shine - Đà Nẵng";
            default: return "Không xác định";
        }
    };
    const branchStyles: Record<string, React.CSSProperties> = {
        "CN001": { backgroundColor: '#fff1f0', color: '#f5222d' },
        "CN002": { backgroundColor: '#e6f7ff', color: '#1890ff' },
        "CN003": { backgroundColor: '#f6ffed', color: '#52c41a' },
        "CN004": { backgroundColor: '#fff7e6', color: '#fa8c16' },
    };

    //lấy theo trạng thái
    //<option value="Đã đặt">Đã đặt</option>
    // <option value="Đang chờ">Đang chờ</option>
    // <option value="Đang thực hiện">Đang thực hiện</option>
    // <option value="Hoàn thành">Hoàn thành</option>
    // <option value="Đã huỷ">Đã huỷ</option>
    const statusStyles: Record<string, React.CSSProperties> = {
        "Đã đặt": { backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' },
        "Đang chờ": { backgroundColor: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' },
        "Đang thực hiện": { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' },
        "Hoàn thành": { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' },
        "Đã huỷ": { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' },
    };

    //Định nghĩa cột cho DataTable theo api trả về
    const bookingColumns: Column<Booking>[] = [
        { tieude: "ID", cotnhandulieu: "MALICH" },
        { tieude: "Ngày hẹn", cotnhandulieu: "NGAYHEN", render: (row) => row.NGAYHEN ? new Date(row.NGAYHEN).toLocaleDateString('vi-VN') : '' },
        {
            tieude: "Giờ hẹn",
            cotnhandulieu: "GIOHEN",
            render: (row) => {
                if (!row.GIOHEN) return "";

                // chuỗi có chứa chữ 'T' (dạng ISO 1970-01-01T09:00:00...)
                if (row.GIOHEN.includes('T')) {
                    //Tách chuỗi lấy đoạn giữa (09:00)
                    return row.GIOHEN.split('T')[1].substring(0, 5);
                }

                // Nếu dạng 09:00:00 lấy 5 ký tự đầu
                return row.GIOHEN.substring(0, 5);
            }
        },
        {
            tieude: "Trạng thái", cotnhandulieu: "TRANGTHAI", render: (row) => {
                const style = statusStyles[row.TRANGTHAI?.trim() || ''] || {};
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        ...style
                    }}>
                        {style ? row.TRANGTHAI : "Không xác định"}
                    </span>
                )
            }
        },
        {
            tieude: "Chi nhánh", cotnhandulieu: "MACHINHANH", render: (row) => {
                const style = branchStyles[row.MACHINHANH?.trim() || ''] || {};
                return (
                    <span style={style}>
                        {getChiNhanhName(row.MACHINHANH?.trim() || '')}
                    </span>
                );
            }

        },
        { tieude: "Khách hàng", cotnhandulieu: "MAKH" },

        {
            tieude: "Hành động", cotnhandulieu: "MALICH", render: (row) => (
                <>
                    <button className="btn small view" onClick={() => handleViewClick(row)}><i className="fas fa-eye"></i></button>
                    <button className="btn small addDetail" onClick={() => handleAddDetailsClick(row)}><i className="fa-regular fa-calendar-plus"></i></button>
                    <button className="btn small edit" onClick={() => handleEditClick(row)}><i className="fas fa-edit"></i></button>
                    <button
                        className="btn small delete"
                        onClick={() => handleDeleteClick(row)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </>
            )
        },
    ];
    //Định nghĩa cột cho DataTable theo api trả về
    const bookingDetailsColumns: Column<BookingDetails>[] = [
        { tieude: "ID", cotnhandulieu: "MALICH" },
        {
            tieude: "Dịch vụ", cotnhandulieu: "MADV", render(row) {
                const dichVu = dichVuList.find(dv => dv.MADV === row.MADV);
                return dichVu ? dichVu.TENDV : "Không xác định";

            }
        },
        {
            tieude: "Nhân viên", cotnhandulieu: "MANV", render(row) {
                const nv = nhanVienList.find(nv => nv.MANV === row.MANV);
                return nv ? `${nv.HOTEN} (${nv.MANV})` : "Không xác định";
            }
        },
        { tieude: "Số lượng", cotnhandulieu: "SOLUONG" },
        {
            tieude: "Giá dự kiến", cotnhandulieu: "GIA_DUKIEN", render(row) {
                const value = parseFloat(row.GIA_DUKIEN as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            },
        },
        { tieude: "Ghi chú", cotnhandulieu: "GHICHU" },
    ];



    // TỰ ĐỘNG TÍNH TOÁN GIỜ TRỐNG
    const availableHours = useMemo(() => {
        if (!formData.nhanvien || !formData.bookingDate) {
            return [];
        }
        //tìm lịch đã được khách chọn nhân viên thực hiện trong ngày đó
        const bookedIdsForStaff = bookingDetailsList
            .filter(detail => detail.MANV?.trim() === formData.nhanvien)
            .map(detail => detail.MALICH?.trim());

        //lọc ra những lịch ngày đó, chưa huỷ hoặc chưa hoàn thành và có nhân viên thực hiện trùng với nhân viên đang chọn
        const lichDabook = bookingList.filter(booking => {
            const trungNgay = booking.NGAYHEN && booking.NGAYHEN.split('T')[0] === formData.bookingDate;
            const chuahuy = booking.TRANGTHAI !== "Đã huỷ";
            const chuahoanthanh = booking.TRANGTHAI !== "Đã hoàn thành";
            //iclude kiểm tra mã lịch của booking có nằm trong danh sách mã lịch đã được chọn nhân viên thực hiện hay không
            const NVDuocChon = bookedIdsForStaff.includes(booking.MALICH?.trim());

            return trungNgay && chuahuy && chuahoanthanh && NVDuocChon;
        });

        //giờ hẹn từ API
        //Chỉ lấy 5 ký tự đầu (HH:mm) để bỏ qua giây (nếu có)
        const bookedHours = lichDabook.map(b => {
            return b.GIOHEN ? b.GIOHEN.substring(0, 5) : "";
        });
        //tạo danh sách giờ trống từ 8h đến 22h với khoảng cách 30 phút
        const hours: string[] = [];
        for (let h = 8; h <= 22; h++) {
            for (let m of [0, 30]) {
                //Định dạng giờ thành HH:mm
                const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                //thêm vào select
                if (!bookedHours.includes(time)) {
                    hours.push(time);
                }
            }
        }
        return hours;
    }, [formData.nhanvien, formData.bookingDate, bookingList, bookingDetailsList]);

    const handleClickReport = async () => {
        //e.preventDefault();
        try {
            if (!formDataTK.start || !formDataTK.end) {
                toast.warn("Hãy chọn ngày cần lọc!");
                return;
            }
            const ngaybd = formDataTK.start.toString();
            const ngaykt = formDataTK.end.toString();
            //console.log(ngaybd);
            //console.log(ngaykt);
            if (ngaybd > ngaykt) {
                toast.warn("Ngày bắt đầu lọc phải nhỏ hơn ngày kết thúc!");
                return;
            }
            const resLichByNgay = await bookingApi.getByNgay(formDataTK.start, formDataTK.end)

            if (resLichByNgay.data.success && resLichByNgay.data.data) {
                setBookingList(resLichByNgay.data.data);
            } else {
                setBookingList([]); // Không có reset về rỗng
            }


            toast.success('Lọc theo ngày thành công!');
        }
        catch (error) {
            console.error("Lỗi khi lọc theo ngày:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu!");
        }
    }
    const handleClickRefresh = async () => {
        setFormDataTK({
            start: '',
            end: ''
        })
        await fetchData();
        toast.success('Làm mới thành công!');
    }
    //HÀM RENDER FORM CHUNG CHO CẢ THÊM VÀ SỬA
    const renderFormContent = () => (
        <>
            <div className="form-group">
                <label>Mã lịch hẹn:</label>
                <input type="text"
                    id="bookingID"
                    placeholder="Nhập mã lịch hẹn..."
                    value={formData.bookingID || formDataDetails.bookingID}
                    onChange={handleChange}
                    disabled={modalType !== 'add'} />
                {formErrors.bookingID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.bookingID}</span>}
            </div>
            <div hidden={modalType === 'edit' || modalType === 'addDetails'} className="form-group">
                <label>Chi Nhánh:</label>
                <select id="branchID" value={formData.branchID} onChange={handleChange}>
                    <option value="">-- Chọn chi nhánh --</option>
                    <option value="CN001">30Shine - Nguyễn Trãi</option>
                    <option value="CN002">30Shine - Cầu Giấy</option>
                    <option value="CN003">30Shine - Tân Bình</option>
                    <option value="CN004">30Shine - Đà Nẵng</option>
                </select>
                {formErrors.branchID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.branchID}</span>}
            </div>
            <div hidden={modalType === 'edit'} className="form-group">
                <label>Nhân viên:</label>
                <select id="nhanvien" value={formData.nhanvien} disabled={!formData.branchID} onChange={handleChange}>
                    <option value="">-- Chọn nhân viên --</option>
                    {/* lọc nhân viên theo chi nhánh đã chọn và chức vụ */}
                    {nhanVienList.filter((nv) => nv.MACHINHANH?.trim() === formData.branchID?.trim() && nv.CHUCVU?.trim() === "Stylist").map((nv) => (
                        <option key={nv.MANV?.trim()} value={nv.MANV?.trim()}>
                            {nv.MANV} - {nv.HOTEN} {`(${nv.SDT})`}
                        </option>
                    ))}
                </select>
                {formErrors.nhanvien && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.nhanvien}</span>}
            </div>
            <div hidden={modalType === 'edit' || modalType === 'addDetails'} className="form-group">
                <label>Ngày hẹn:</label>
                <input type="date" id="bookingDate" value={formData.bookingDate} onChange={handleChange} />
                {formErrors.bookingDate && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.bookingDate}</span>}
            </div>
            <div hidden={modalType === 'edit' || modalType === 'addDetails'} className="form-group">
                <label>Giờ hẹn:</label>
                <select
                    id="bookingTime"
                    className="input-field"
                    value={formData.bookingTime}
                    onChange={handleChange}
                    disabled={!formData.nhanvien || !formData.bookingDate}
                >
                    <option value="">-- Chọn giờ hẹn --</option>
                    {/* Đổ danh sách giờ trống */}
                    {availableHours.map((time) => (
                        <option key={time} value={time}>
                            {time}
                        </option>
                    ))}
                </select>
                {formErrors.bookingTime && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.bookingTime}</span>}
            </div>

            <div hidden={modalType === 'edit' || modalType === 'addDetails'} className="form-group">
                <label>Khách Hàng:</label>
                <select id="customerID" value={formData.customerID} onChange={handleChange}>
                    <option value="">-- Chọn khách hàng --</option>
                    {/* đổ dữ liệu khách hàng */}
                    {customerList.map((customer) => (
                        <option key={customer.MAKH} value={customer.MAKH}>
                            ({customer.SDT}) {customer.HOTEN}
                        </option>
                    ))}
                </select>
                {formErrors.customerID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.customerID}</span>}
            </div>
            <div hidden={modalType === 'edit'} className="form-group">
                <label>Dịch vụ:</label>
                <select id="dichvu" value={formData.dichvu} onChange={handleChange}>
                    <option value="">-- Chọn dịch vụ --</option>
                    {/* đổ dữ liệu dịch vụ */}
                    {dichVuList.map((dv) => (
                        <option key={dv.MADV} value={dv.MADV?.trim()}>
                            {dv.TENDV} - {dv.THOIGIAN} phút - {dv.GIADV.toLocaleString()} VNĐ
                        </option>
                    ))}
                </select>
                {formErrors.dichvu && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.dichvu}</span>}
            </div>
            <div hidden={modalType === 'edit'} className="form-group">
                <label>Số lượng:</label>
                <input type="number" id="soluong" value={formData.soluong} onChange={handleChange} min="1" max="20" />
            </div>
            <div hidden={modalType === 'add' || modalType === 'addDetails'} className="form-group">
                <label>Trạng thái:</label>
                <select id="status" value={formData.status} onChange={handleChange}>
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Đã đặt">Đã đặt</option>
                    <option value="Đang chờ">Đang chờ</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã huỷ">Đã huỷ</option>
                </select>
                {formErrors.trangthai && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.trangthai}</span>}
            </div>
            <div hidden={modalType !== 'addDetails'} className="form-group">
                <label>Ghi chú:</label>
                <textarea id="ghichu" placeholder="Nhập ghi chú..." value={formDataDetails.ghichu} onChange={(e) => setFormDataDetails(prev => ({ ...prev, ghichu: e.target.value }))}></textarea>
            </div>

            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );
    return (

        <>
            <div id="bookings" className="section">
                <div className="panel header-actions">
                    <h2>Lịch hẹn</h2>
                    <button className="btn primary" onClick={handleOpenAdd}>Thêm lịch hẹn</button>
                </div>
                <div className="panel">
                    <div className="reportDate-form">
                        <div className="form-group reportDate">
                            <label>Từ ngày:</label>
                            <input value={formDataTK.start} onChange={handleChange} type="date" id="start" />
                        </div>
                        <div className="form-group reportDate">
                            <label>Đến ngày:</label>
                            <input value={formDataTK.end} onChange={handleChange} type="date" id="end" />
                        </div>
                        <button onClick={handleClickReport} className="btn primary">
                            <i className="fas fa-filter"></i> Xem lịch hẹn theo ngày
                        </button>
                        <button onClick={handleClickRefresh} className="btn secondary">
                            <i className="fas fa-sync"></i> Làm mới
                        </button>
                    </div>
                </div>
                {/* CHỈ RENDER KHU VỰC NÀY NẾU IDtoView CÓ GIÁ TRỊ */}
                {IDtoView && (
                    <div id="booking-details" className="booking-details" style={{ display: 'block' }}>
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        <h3 id="tieudechitiet">Chi tiết lịch hẹn {IDtoView}</h3>
                        <button
                            type="button"
                            className="btn small delete"
                            onClick={() => {
                                setIDtoView(null); //ẩn bảng
                                setViewDetailsList([]); //Xóa data
                            }}
                        >
                            <i className="fa-solid fa-circle-xmark"></i> Đóng
                        </button>

                        <DataTable<BookingDetails>
                            columns={bookingDetailsColumns}
                            data={viewDetailsList}
                            isLoading={isLoading}
                        />

                    </div>
                )}
                <div className="panel">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <DataTable<Booking> columns={bookingColumns} data={filteredBookingList} isLoading={isLoading} />
                </div>
                {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
                <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới lịch hẹn" : "Sửa thông tin lịch hẹn"}>
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>
                {/* modal thêm chi tiết */}
                <Modal isOpen={modalType === 'addDetails'} onClose={() => setModalType('none')} title="Thêm chi tiết lịch hẹn">
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>

                {/* Modal xóa */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                    <p>Bạn có chắc chắn muốn xóa lịch hẹn <strong>{idToDelete}</strong> không?</p><br />
                    <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
                </Modal>
            </div>
        </>
    );
};

export default BookingPage;