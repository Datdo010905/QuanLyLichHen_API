import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../components/ui/Modal";
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import bookingApi, { Booking, BookingDetails } from "../../api/bookingApi";
import hoadonApi, { HoaDon, HoaDonDetails } from "../../api/hoadonApi";
import customerApi, { Customer } from "../../api/customerApi";
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import staffApi, { NhanVien } from "../../api/staffApi";
import { HoadonSchema } from "../../utils/hoadonSchema";
import KhuyenMaiApi, { KhuyenMai } from "../../api/khuyenmaiApi";

const HoaDonPage = () => {
    //khởi tạo state

    const [modalType, setModalType] = useState<'add' | 'addDetails' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa
    const [IDtoView, setIDtoView] = useState<string | null>(null); // Lưu ID cần xem chi tiết
    const today = new Date().toISOString().split('T')[0];

    const quyenHientai = localStorage.getItem('phanquyen') || 0;
    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();
    //Dữ liệu
    const [hoadonList, setHoadonList] = useState<HoaDon[]>([]);
    const [hoadonDetailsList, setHoadonDetailsList] = useState<HoaDonDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookingList, setBookingList] = useState<Booking[]>([]);
    const [bookingDetailsList, setBookingDetailsList] = useState<BookingDetails[]>([]);
    const [customerList, setCustomerList] = useState<Customer[]>([]);
    const [dichVuList, setDichVuList] = useState<DichVu[]>([]);
    const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
    const [khuyenMaiList, setKhuyenMaiList] = useState<KhuyenMai[]>([]);
    const [viewDetailsList, setViewDetailsList] = useState<HoaDonDetails[]>([]);
    const filteredHoadonList = hoadonList.filter(hd =>
        hd.MALICH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hd.MAKH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hd.TRANGTHAI?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hd.MANV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hd.MAHD?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hd.NGAYTHANHTOAN
            ? new Date(hd.NGAYTHANHTOAN).toLocaleDateString('vi-VN').includes(searchTerm)
            : false)
    );

    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resHoadon = await hoadonApi.getAll();
            const resNhanVien = await staffApi.getAll();
            const resKH = await customerApi.getAll();
            const resDichVu = await dichVuApi.getAll();
            const resBooking = await bookingApi.getAll();
            const resHoaDonDetails = await hoadonApi.getAllCT();
            const resBookingDetails = await bookingApi.getAllCT();
            const resKM = await KhuyenMaiApi.getAll();

            if (resHoadon.data.success) {
                setHoadonList(resHoadon.data.data);
            }
            if (resKM.data.success) {
                setKhuyenMaiList(resKM.data.data);
            }
            if (resHoaDonDetails.data.success) {
                setHoadonDetailsList(resHoaDonDetails.data.data);
            }

            if (resKH.data.success) {
                setCustomerList(resKH.data.data);
            }
            if (resDichVu.data.success) {
                setDichVuList(resDichVu.data.data);
            }
            if (resNhanVien.data.success) {
                setNhanVienList(resNhanVien.data.data);
            }
            if (resBooking.data.success) {
                setBookingList(resBooking.data.data);
            }
            if (resBookingDetails.data.success) {
                setBookingDetailsList(resBookingDetails.data.data);
            }
            // const ngaythanhtoan = new Date().toISOString().split('T')[0];
            // console.log(ngaythanhtoan);


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


    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        hoadonID: '',
        khachhangID: '',
        khuyenmaiID: '',
        bookingID: '',
        nhanvienID: '',
        sum: '',
        methodPayment: '',
        status: '',
        branchID: '',
        dateThanhToan: ''
    });
    const [formDataDetails, setFormDataDetails] = useState({
        hoadonID: '',
        dichvuID: '',
        soluongdung: '',
        dongiadv: '',
        thanhtiendv: '',
    });
    const [formDataTK, setFormDataTK] = useState({
        start: '',
        end: ''
    });
    // Chuẩn bị form rỗng khi Thêm 
    const handleOpenAdd = () => {
        setFormData({
            hoadonID: '',
            khachhangID: '',
            khuyenmaiID: '',
            bookingID: '',
            nhanvienID: '',
            sum: '',
            methodPayment: '',
            status: '',
            branchID: '',
            dateThanhToan: ''
        });
        setFormDataDetails({
            hoadonID: '',
            dichvuID: '',
            soluongdung: '',
            dongiadv: '',
            thanhtiendv: '',
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };
    //xử lý thay đổi form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Cập nhật dữ liệu người dùng nhập vào formData
        setFormData((prev) => ({ ...prev, [id]: value }));
        setFormDataDetails((prev) => ({ ...prev, [id]: value }));
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

    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        //có lỗi
        if (modalType === 'add') {
            // Kiểm tra toàn bộ dữ liệu với Zod khi thêm mới
            const validationResult = HoadonSchema.safeParse({
                ...formData,
                ...formDataDetails
            });

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
            if (!formData.nhanvienID) {
                setFormErrors({ nhanvienID: "Thu ngân không được để trống" });
                return;
            }
            if (!formData.methodPayment) {
                setFormErrors({ methodPayment: "Hình thức thanh toán không được để trống" });
                return;
            }
        }
        //hợp lệ
        setFormErrors({});

        //tạo FormData theo swagger
        //form hoá đơn
        // const submitData = new FormData();
        // submitData.append('MaHD', formData.hoadonID);
        // submitData.append('MaKH', formData.khachhangID);
        // submitData.append('MaKM', formData.khuyenmaiID);
        // submitData.append('MaLich', formData.bookingID || '');
        // submitData.append('MaNV', formData.nhanvienID);

        let finalTongTien = 0;

        if (modalType === 'add') {
            //giá dịch vụ * số lượng và trừ đi khuyến mại
            const dichVuSelected = dichVuList.find(dv => dv.MADV.trim() === formDataDetails.dichvuID);
            const donGia = dichVuSelected ? Number(dichVuSelected.GIADV) : 0;
            const soLuong = Number(formDataDetails.soluongdung || 0);

            const khuyenmaiSelected = khuyenMaiList.find(km => km.MAKM.trim() === formData.khuyenmaiID);
            const giamgia = khuyenmaiSelected ? (khuyenmaiSelected.GIATRI) : 0;

            const tongTienGoc = donGia * soLuong;
            //console.log("Tiền chưa giảm giá:", tongTienGoc);
            //console.log("Đơn giá:", donGia);
            //console.log("Số lượng:", soLuong);
            //console.log("Khuyến mại:", giamgia / 100);
            finalTongTien = Math.round(tongTienGoc - (tongTienGoc * giamgia / 100));
        } else {
            finalTongTien = Math.round(Number(formData.sum || 0));
        }
        //console.log("Tổng tiền chuẩn bị gửi đi là:", finalTongTien);


        // submitData.append('TongTien', finalTongTien.toString());
        // submitData.append('HinhThucThanhToan', formData.methodPayment);
        // submitData.append('TrangThai', formData.status || 'Chưa thanh toán');
        //chỉ thêm thì mới lấy ngày hiện tại
        const ngayTT = modalType === 'add'
            ? new Date().toISOString().split('T')[0]
            : formData.dateThanhToan; // Lấy lại ngày cũ đã lưu trong state khi sửa

        // submitData.append('NgayTT', ngayTT);


        // TẠO JSON HÓA ĐƠN
        const submitData: HoaDon = {
            MAHD: formData.hoadonID.trim(),
            MAKH: formData.khachhangID.trim() || '',
            MAKM: formData.khuyenmaiID.trim() || '',
            MALICH: formData.bookingID.trim() || '',
            MANV: formData.nhanvienID.trim(),
            TONGTIEN: finalTongTien,
            HINHTHUCTHANHTOAN: formData.methodPayment.trim(),
            TRANGTHAI: formData.status.trim() || 'Chưa thanh toán',
            NGAYTT: ngayTT
        } as any; // Ép kiểu vì có biến phụ NGAYTT

        // //form chi tiết hoá đơn
        // const submitDataCT = new FormData();
        // submitDataCT.append('MaHD', formData.hoadonID);
        // submitDataCT.append('MaDV', formDataDetails.dichvuID);
        // submitDataCT.append('SoLuong', formDataDetails.soluongdung);
        // //lấy đơn giá theo dịch vụ
        // const dichVuChon = dichVuList.find(dv => dv.MADV.trim() === formDataDetails.dichvuID.trim());
        // submitDataCT.append('DonGia', dichVuChon ? dichVuChon.GIADV.toString() : '0');
        // //tính thành tiền cho chi tiết
        // const thanhtienCT = dichVuChon ? (Number(dichVuChon.GIADV) * Number(formDataDetails.soluongdung)).toString() : '0';
        // submitDataCT.append('ThanhTien', thanhtienCT);

        // const trangthaiHienTai = hoadonList.find(b => b.MAHD.trim() === formData.hoadonID.trim())?.TRANGTHAI || "Chưa thanh toán";
        // //const trangthaiMoi = formData.status;
        // TẠO JSON CHI TIẾT
        const dichVuChon = dichVuList.find(dv => dv.MADV?.trim() === formDataDetails.dichvuID?.trim());
        const donGiaCT = dichVuChon ? Number(dichVuChon.GIADV) : 0;

        const submitDataCT: HoaDonDetails = {
            MAHD: formData.hoadonID.trim(),
            MADV: formDataDetails.dichvuID.trim(),
            SOLUONG: Number(formDataDetails.soluongdung),
            DONGIA: donGiaCT,
            THANHTIEN: (donGiaCT * Number(formDataDetails.soluongdung)).toString()
        };

        const trangthaiHienTai = hoadonList.find(b => b.MAHD?.trim() === formData.hoadonID?.trim())?.TRANGTHAI?.trim();
        try {

            if (modalType === 'add') {
                // Check 404 cho hàm kiểm tra tồn tại
                let isExist = false;
                try {
                    const checkExist = await hoadonApi.getById(formData.hoadonID);
                    if (checkExist && checkExist.data.success) isExist = true;
                } catch (err: any) {
                    if (err.response && err.response.status === 404) isExist = false;
                    else throw err;
                }

                if (isExist) {
                    toast.error("Hóa đơn đã tồn tại!");
                    return;
                }
                await hoadonApi.create(submitData);
                await hoadonApi.createCT(submitDataCT);
                toast.success("Thêm hóa đơn thành công!");

            }
            else if (modalType === 'edit') {
                //chưa thanh toán -> đã thanh toán
                //chưa thanh toán -> đã huỷ   
                if (trangthaiHienTai === "Đã huỷ" || trangthaiHienTai === "Đã thanh toán") {
                    toast.error("Hóa đơn đã " + trangthaiHienTai + ", không thể thay đổi trạng thái nữa!");
                    return;
                }
                // if (trangthaiHienTai === "Chưa thanh toán" && trangthaiMoi !== "Đã thanh toán" && trangthaiMoi !== "Đã huỷ") {
                //     toast.error("Trạng thái phải theo quy trình: Chưa thanh toán -> Đã thanh toán hoặc -> Đã huỷ");
                //     return;
                // }

                await hoadonApi.update(formData.hoadonID, submitData);
                toast.success("Cập nhật hóa đơn thành công!");
            }
            else {
                if (trangthaiHienTai !== "Chưa thanh toán") {
                    toast.error("Chỉ có thể thêm chi tiết cho hóa đơn ở trạng thái Chưa thanh toán!");
                    return;
                }

                if (!formDataDetails.dichvuID || !formDataDetails.soluongdung) {
                    toast.error("Dịch vụ, số lượng không được để trống!");
                    return;
                }
                await hoadonApi.createCT(submitDataCT);
                toast.success("Thêm chi tiết hóa đơn thành công!");
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
            toast.error("Bạn không có quyền xóa hoá đơn!");
            return;
        }
        try {
            //chỉ xoá những hoá đơn đã huỷ
            const hoadon = hoadonList.find(b => b.MAHD.trim() === idToDelete.trim());
            if (hoadon?.TRANGTHAI.trim() !== "Đã huỷ") {
                toast.error("Chỉ có thể xóa những hóa đơn đã huỷ!");
                return;
            }
            try {
                await hoadonApi.deleteCT(idToDelete.trim());
            }
            catch (error) {
                console.error("Lỗi xóa chi tiết:", error);
            }

            await hoadonApi.delete(idToDelete.trim());

            toast.success("Xóa hóa đơn thành công!");
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
    const handleDeleteClick = (row: HoaDon) => {
        setIdToDelete(row.MAHD.trim() || null);
        setIsDeleteModalOpen(true);
    };

    const handleViewClick = async (row: HoaDon) => {
        try {
            setIDtoView(row.MAHD.trim() || null);

            const view = await hoadonApi.getByIdCT(row.MAHD.trim() || '');
            if (view.data.success) {
                const responseData = view.data.data;
                // Nếu là mảng thì giữ nguyên, không thì bọc []
                const formattedData = Array.isArray(responseData) ? responseData : [responseData];
                setViewDetailsList(formattedData);

            } else {
                toast.error("Không tìm thấy chi tiết hoá đơn!");
                setViewDetailsList([]); // Xóa rỗng bảng nếu không có data
            }
        } catch (error) {
            console.error("Lỗi xem chi tiết:", error);
            toast.error("Xem chi tiết thất bại!");
            setViewDetailsList([]); // Xóa rỗng bảng nếu không có data
        }
    };
    const handleEditClick = async (row: HoaDon) => {
        // Tìm chi nhánh của nhân viên thu ngân trong hoá đơn này
        const thuNgan = nhanVienList.find(nv => nv.MANV.trim() === row.MANV.trim());
        const machiNhanh = thuNgan ? thuNgan.MACHINHANH.trim() : '';
        setFormData({
            hoadonID: String(row.MAHD || '').trim(),
            khachhangID: String(row.MAKH || '').trim(),
            khuyenmaiID: String(row.MAKM || '').trim(),
            bookingID: String(row.MALICH || '').trim(),
            nhanvienID: String(row.MANV || '').trim(),
            sum: row.TONGTIEN != null ? String(row.TONGTIEN) : '',
            methodPayment: String(row.HINHTHUCTHANHTOAN || ''),
            status: String(row.TRANGTHAI || '').trim() || 'Chưa thanh toán',
            branchID: machiNhanh,
            dateThanhToan: row.NGAYTHANHTOAN
                ? String(row.NGAYTHANHTOAN).split('T')[0]
                : '',
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('edit');
    };
    const handleAddDetailsClick = async (row: HoaDon) => {
        const thuNgan = nhanVienList.find(nv => nv.MANV.trim() === row.MANV.trim());
        const machiNhanh = thuNgan ? thuNgan.MACHINHANH.trim() : '';
        setFormData({
            hoadonID: String(row.MAHD || '').trim(),
            khachhangID: String(row.MAKH || '').trim(),
            khuyenmaiID: String(row.MAKM || '').trim(),
            bookingID: String(row.MALICH || '').trim(),
            nhanvienID: String(row.MANV || '').trim(),
            sum: String(row.TONGTIEN) || '',
            methodPayment: String(row.HINHTHUCTHANHTOAN || ''),
            status: String(row.TRANGTHAI || '').trim() || 'Chưa thanh toán',
            branchID: machiNhanh,
            dateThanhToan: String(row.NGAYTHANHTOAN) || 'Không xác định'
        });
        setFormDataDetails({
            hoadonID: String(row.MAHD || ''),
            dichvuID: '',
            soluongdung: '',
            dongiadv: '',
            thanhtiendv: '',
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('addDetails');
    }

    //nếu là khách vãng lai thì chọn chi nhánh dùng dịch vụ sẽ ra thu ngân tại đó
    //còn khách có lịch hẹn thì khi chọn lịch hẹn sẽ lấy chi nhánh của lịch hẹn và lấy thu ngân ở đó
    const chiNhanhhoacLich = formData.bookingID && formData.bookingID !== ""
        ? bookingList.find(b => b.MALICH.trim() === formData.bookingID?.trim())?.MACHINHANH
        : formData.branchID;

    //HÀM RENDER FORM CHUNG CHO CẢ THÊM VÀ SỬA
    const renderFormContent = () => (
        <>
            <div className="form-group">
                <label>Mã hoá đơn:</label>
                <input type="text"
                    id="hoadonID"
                    placeholder="Nhập mã hoá đơn..."
                    value={formData.hoadonID.trim() || formDataDetails.hoadonID.trim()}
                    onChange={handleChange}
                    disabled={modalType !== 'add'} />
                {formErrors.hoadonID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.hoadonID}</span>}
            </div>
            <div hidden={modalType === "add" || modalType === "addDetails"} className="form-group">
                <label>Lịch hẹn:</label>
                <select id="bookingID" disabled={modalType === 'edit'} value={formData.bookingID} onChange={handleChange}>
                    <option value="">Không có lịch hẹn</option>
                    {formData.bookingID && formData.bookingID !== "" && (
                        <option value={formData.bookingID?.trim()}>{formData.bookingID?.trim()}</option>
                    )}
                </select>
                {formErrors.bookingID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.bookingID}</span>}
            </div>

            <div hidden={modalType === "addDetails"} className="form-group">
                <label>Khách hàng:</label>
                <select disabled={modalType !== 'add'} id="khachhangID" value={formData.khachhangID} onChange={handleChange}>
                    <option value="">-- Chọn khách hàng --</option>
                    {customerList.map((customer) => (
                        <option key={customer.MAKH?.trim()} value={customer.MAKH?.trim()}>
                            ({customer.SDT}) {customer.HOTEN}
                        </option>
                    ))}
                </select>
                {formErrors.khachhangID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.khachhangID}</span>}
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
                <label>Dịch vụ:</label>
                <select id="dichvuID" value={formDataDetails.dichvuID} onChange={handleChange}>
                    <option value="">-- Chọn dịch vụ --</option>
                    {dichVuList.map((dv) => (
                        <option key={dv.MADV?.trim()} value={dv.MADV?.trim()}>
                            {dv.TENDV} - {Number(dv.GIADV).toLocaleString('vi-VN')}₫
                        </option>
                    ))}
                </select>
                {formErrors.dichvuID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.dichvuID}</span>}
            </div>
            <div hidden={modalType === 'edit'} className="form-group">
                <label>Số lượng:</label>
                <input
                    type="number"
                    id="soluongdung"
                    placeholder="Nhập số lượng..."
                    value={formDataDetails.soluongdung}
                    onChange={handleChange}
                />
                {formErrors.soluongdung && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.soluongdung}</span>}
            </div>

            <div hidden={modalType === "addDetails"} className="form-group">
                <label>Khuyến mại:</label>
                <select id="khuyenmaiID" value={formData.khuyenmaiID} onChange={handleChange}>
                    <option value="">-- Chọn khuyến mại --</option>
                    {khuyenMaiList.filter((km) => km.TRANGTHAI?.trim() === "Đang áp dụng").map((km) =>
                    (
                        <option key={km.MAKM?.trim()} value={km.MAKM?.trim()}>
                            {km.TENKM} ({km.MOTA})
                        </option>
                    ))};
                </select>
                {formErrors.khuyenmaiID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.khuyenmaiID}</span>}
            </div>

            <div hidden={modalType === "addDetails"} className="form-group">
                <label>Thu ngân:</label>
                <select id="nhanvienID" value={formData.nhanvienID} onChange={handleChange}>
                    <option value="">-- Chọn thu ngân --</option>
                    {/* lọc nhân viên theo chi nhánh đã chọn và chức vụ */}
                    {/* hoặc chọn lịch thì lọc theo thu ngân từ chi nhánh của lịch đó */}
                    {nhanVienList.filter((nv) => nv.MACHINHANH?.trim() === chiNhanhhoacLich?.trim() && nv.CHUCVU?.trim() === "Thu ngân").map((nv) => (
                        <option key={nv.MANV?.trim()} value={nv.MANV?.trim()}>
                            {nv.MANV} - {nv.HOTEN} {`(${nv.SDT})`}
                        </option>
                    ))}
                </select>
                {formErrors.nhanvienID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.nhanvienID}</span>}
            </div>
            <div hidden={modalType === "add" || modalType === "addDetails"} className="form-group">
                <label>Tổng tiền:</label>
                <input disabled={modalType === 'edit'} type="text" id="sum" placeholder="Tổng tiền..." value={formData.sum} onChange={handleChange} />
                {formErrors.sum && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.sum}</span>}
            </div>


            <div hidden={modalType === 'addDetails'} className="form-group">
                <label>Ngày thanh toán:</label>
                <input
                    type="date"
                    id="dateThanhToan"
                    value={formData.dateThanhToan}
                    onChange={handleChange}
                    disabled={modalType === 'edit'}
                    max={today}
                />
            </div>
            <div hidden={modalType === "addDetails"} className="form-group">
                <label>Hình thức thanh toán:</label>
                <select id="methodPayment" value={formData.methodPayment} onChange={handleChange}>
                    <option value="">-- Chọn hình thức --</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Ví điện tử">Ví điện tử</option>
                </select>
                {formErrors.methodPayment && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.methodPayment}</span>}
            </div>

            <div hidden={modalType !== 'edit'} className="form-group">
                <label>Trạng thái:</label>
                <select id="status" value={formData.status} onChange={handleChange}>
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Đã huỷ">Đã huỷ</option>
                </select>
                {formErrors.status && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.status}</span>}
            </div>
            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );

    //CSS cho hình thức thanh toán
    const MethodPayment: Record<string, React.CSSProperties> = {
        "Tiền mặt": {
            backgroundColor: '#f6ffed',
            color: '#389e0d',
            border: '1px solid #b7eb8f'
        },
        "Thẻ tín dụng": {
            backgroundColor: '#e6f7ff',
            color: '#096dd9',
            border: '1px solid #91d5ff'
        },
        "Chuyển khoản": {
            backgroundColor: '#e6fffe',
            color: '#08a4d4',
            border: '1px solid #91ccff'
        },
        "Ví điện tử": {
            backgroundColor: '#f9f0ff',
            color: '#531dab',
            border: '1px solid #d3adf7'
        },
        "Không xác định": {
            backgroundColor: '#fafafa',
            color: '#595959',
            border: '1px solid #d9d9d9'
        },
    };


    //css cho trạng thái
    const statusStyles: Record<string, React.CSSProperties> = {
        "Chưa thanh toán": { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' },
        "Đã thanh toán": { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' },
        "Đã huỷ": { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' },
    };

    //Định nghĩa cột cho DataTable theo api trả về
    const hoadonColumns: Column<HoaDon>[] = [
        { tieude: "ID", cotnhandulieu: "MAHD" },
        {
            tieude: "Ngày lập", cotnhandulieu: "NGAYTHANHTOAN", render(row) {
                return row.NGAYTHANHTOAN ? new Date(row.NGAYTHANHTOAN).toLocaleDateString('vi-VN') : "Chưa có";
            },
        },
        {
            tieude: "Khách hàng", cotnhandulieu: "MAKH", render: (row) => {
                const tenkh = customerList.find(kh => kh.MAKH?.trim() === row.MAKH?.trim())?.HOTEN;
                return `${row.MAKH} - ${tenkh ? tenkh : "Khách vãng lai"}`;
            }
        },
        // {
        //     tieude: "Khuyến mại", cotnhandulieu: "MAKM", render: (row) => {
        //         return row.MAKM ? row.MAKM : "Không có";
        //     }
        // },
        // {
        //     tieude: "Lịch hẹn", cotnhandulieu: "MALICH", render: (row) => {
        //         return row.MALICH ? row.MALICH : "Không có";
        //     }
        // },
        {
            tieude: "Thu ngân", cotnhandulieu: "MANV", render: (row) => {
                const tennv = nhanVienList.find(nv => nv.MANV?.trim() === row.MANV?.trim())?.HOTEN;
                return `${row.MANV} - ${tennv ? tennv : "Không xác định"}`;
            }
        },
        {
            tieude: "Tổng tiền", cotnhandulieu: "TONGTIEN", render(row) {
                const value = parseFloat(row.TONGTIEN as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            }
        },
        {
            tieude: "Hình thức thanh toán", cotnhandulieu: "HINHTHUCTHANHTOAN", render: (row) => {
                const method = row.HINHTHUCTHANHTOAN || "Không xác định";
                const style = MethodPayment[method] || MethodPayment["Không xác định"];
                return <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    ...style
                }}>
                    {style ? row.HINHTHUCTHANHTOAN : "Không xác định"}
                </span>;
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
    const hoadonDetailsColumns: Column<HoaDonDetails>[] = [
        { tieude: "ID", cotnhandulieu: "MAHD" },
        {
            tieude: "Mã dịch vụ", cotnhandulieu: "MADV", render(row) {
                const dichVu = dichVuList.find(dv => dv.MADV?.trim() === row.MADV?.trim());
                return dichVu ? dichVu.TENDV : "Không xác định";
            }
        },
        { tieude: "Số lượng", cotnhandulieu: "SOLUONG" },
        {
            tieude: "Đơn giá", cotnhandulieu: "DONGIA", render(row) {
                const value = parseFloat(row.DONGIA as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            },
        },
        {
            tieude: "Thành tiền", cotnhandulieu: "THANHTIEN", render(row) {
                const value = parseFloat(row.THANHTIEN as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            }
        },
    ];

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
            const resHoaDonTheoNgay = await hoadonApi.getByNgay(formDataTK.start, formDataTK.end)

            if (resHoaDonTheoNgay.data.success && resHoaDonTheoNgay.data.data) {
                setHoadonList(resHoaDonTheoNgay.data.data);
            } else {
                setHoadonList([]); // Không có reset về rỗng
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
    return (
        <>
            <div id="invoices" className="section">
                <div className="panel header-actions">
                    <h2>Hoá đơn</h2>
                    <button className="btn primary" onClick={handleOpenAdd}>Thêm hoá đơn</button>
                </div>
                {/* <div className="panel">
                    <DataTable<HoaDonDetails> columns={hoadonDetailsColumns} data={hoadonDetailsList} isLoading={isLoading} />
                </div> */}
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
                            <i className="fas fa-filter"></i> Xem hoá đơn theo ngày
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

                        <h3 id="tieudechitiet">Chi tiết hoá đơn {IDtoView}</h3>
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

                        <DataTable<HoaDonDetails>
                            columns={hoadonDetailsColumns}
                            data={viewDetailsList}
                            isLoading={isLoading}
                        />

                    </div>
                )}
                <div className="panel">
                    <DataTable<HoaDon> columns={hoadonColumns} data={filteredHoadonList} isLoading={isLoading} />
                </div>
                {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
                <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới hoá đơn" : "Sửa thông tin hoá đơn"}>
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>
                {/* modal thêm chi tiết */}
                <Modal isOpen={modalType === 'addDetails'} onClose={() => setModalType('none')} title="Thêm chi tiết hoá đơn">
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>

                {/* Modal xóa */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                    <p>Bạn có chắc chắn muốn xóa hoá đơn <strong>{idToDelete}</strong> không?</p><br />
                    <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
                </Modal>
            </div>
        </>
    );
};

export default HoaDonPage;