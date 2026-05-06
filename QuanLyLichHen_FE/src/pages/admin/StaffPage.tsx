
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import staffApi, { NhanVien } from "../../api/staffApi";
import taikhoanApi, { TaiKhoan } from "../../api/taikhoanApi";
import { staffSchema } from "../../utils/staffSchema";

const StaffPage: React.FC = () => {
    //khởi tạo state
    //Gộp state
    const [modalType, setModalType] = useState<'add' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa
    const [tkToDelete, setTKToDelete] = useState<string | null>(null); // Lưu ID tài khoản cần xóa

    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();

    //Dữ liệu nhân viên
    const [staffList, setStaffList] = useState<NhanVien[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        staffID: '',
        staffName: '',
        staffPosition: '',
        staffPhone: '',
        staffAddress: '',
        staffBranch: '',
        staffBirthDate: '',
        staffAcc: ''
    });
    const filteredStaffList = staffList.filter(nhanvien =>
        nhanvien.MANV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nhanvien.MATK?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nhanvien.SDT?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resStaff = await staffApi.getAll();

            setStaffList(resStaff.data.data);
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
            staffID: '',
            staffName: '',
            staffPosition: '',
            staffPhone: '',
            staffAddress: '',
            staffBranch: '',
            staffBirthDate: '',
            staffAcc: ''
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };

    //click nút sửa
    const handleEditClick = (row: NhanVien) => {
        setFormData({
            staffID: row.MANV.trim() || '',
            staffName: row.HOTEN.trim() || '',
            staffPosition: row.CHUCVU.trim() || '',
            staffPhone: row.SDT.trim() || '',
            staffAddress: row.DIACHI.trim() || '',
            staffBranch: row.MACHINHANH.trim() || '',
            staffBirthDate: row.NGAYSINH ? row.NGAYSINH.split('T')[0] : '',
            staffAcc: row.MATK.trim() || ''
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('edit');
    };
    //xử lý thay đổi form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Cập nhật dữ liệu người dùng nhập vào formData
        setFormData((prev) => ({ ...prev, [id]: value }));

        //Tự động xóa lỗi của chính field đang được gõ
        if (formErrors[id]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[id]; // Xóa thông báo lỗi của field này
                return newErrors;
            });
        }
    };
    const handleDeleteClick = (row: NhanVien) => {
        setIdToDelete(row.MANV || null); // Lưu ID của nhân viên cần xóa
        setTKToDelete(row.MATK || null); // Lưu ID tài khoản cần xóa
        setIsDeleteModalOpen(true);
    };
    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        //Kiểm tra dữ liệu với Zod
        const validationResult = staffSchema.safeParse(formData);

        //có lỗi
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            const newErrors: Record<string, string> = {};

            // Lấy thông báo lỗi đầu tiên của mỗi trường
            for (const key in fieldErrors) {
                newErrors[key] = fieldErrors[key as keyof typeof fieldErrors]?.[0] || '';
            }

            setFormErrors(newErrors);
            return; // Dừng hàm lại, không gọi API
        }
        //hợp lệ
        setFormErrors({});

        //tạo FormData theo swagger
        // const submitData = new FormData();
        // submitData.append('MaNV', formData.staffID);
        // submitData.append('HoTen', formData.staffName);
        // submitData.append('ChucVu', formData.staffPosition);
        // submitData.append('SDT', formData.staffPhone);
        // submitData.append('DiaChi', formData.staffAddress);
        // submitData.append('MaChiNhanh', formData.staffBranch);
        // submitData.append('NgaySinh', formData.staffBirthDate);
        // submitData.append('MaTK', formData.staffAcc);

        const submitData: NhanVien = {
            MANV: formData.staffID,
            HOTEN: formData.staffName,
            CHUCVU: formData.staffPosition,
            SDT: formData.staffPhone,
            DIACHI: formData.staffAddress,
            MACHINHANH: formData.staffBranch,
            NGAYSINH: formData.staffBirthDate,
            MATK: formData.staffAcc
        };



        //check chọn quyền thì role tài khoản sẽ theo
        //case 2: return "Quản lý";
        // case 3: return "Stylist";
        // case 4: return "Thu ngân";
        // case 5: return "Lễ tân";
        const roleMap: Record<string, string> = {
            "Quản lý": "2",
            "Stylist": "3",
            "Thu ngân": "4",
            "Lễ tân": "5"
        };


        // const submitDataTK = new FormData();
        // submitDataTK.append('MaTK', formData.staffAcc);
        // submitDataTK.append('Pass', formData.staffAcc);
        // submitDataTK.append('PhanQuyen', roleMap[formData.staffPosition] || "3");
        // submitDataTK.append('TrangThai', "Hoạt động");

        const submitDataTK: TaiKhoan = {
            MATK: formData.staffID,
            PASS: formData.staffID,
            PHANQUYEN: Number(roleMap[formData.staffPosition] || "3"),
            TRANGTHAI: "Hoạt động"
        };

        //GỘP (Map đúng tên biến mà Backend cần)
        const combinedData = {
            MANV: formData.staffID,
            HOTEN: formData.staffName,
            CHUCVU: formData.staffPosition,
            SDT: formData.staffPhone,
            DIACHI: formData.staffAddress,
            MACHINHANH: formData.staffBranch,
            NGAYSINH: formData.staffBirthDate,
            PASS: formData.staffPhone,
            PHANQUYEN: Number(roleMap[formData.staffPosition] || "3"),
            TRANGTHAI: "Hoạt động"
        };
        try {
            if (modalType === 'add') {
                const res = await staffApi.createFull(combinedData);
                toast.success(res.data.message || "Thêm nhân viên thành công!");
            }
            else {
                if (formData.staffID === 'NV001') {
                    toast.error("Không thể sửa nhân viên này!");
                    setModalType('none');
                    return;
                }
                await staffApi.update(formData.staffID, submitData);
                toast.success("Cập nhật nhân viên thành công!");
            }
            setModalType('none'); // Đóng form
            fetchData(); // Tải lại dữ liệu
        } catch (error: any) {
            // HỨNG LỖI TỪ BACKEND
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Thao tác thất bại, vui lòng kiểm tra lại!");
            }
        }
    };
    // xoá
    const handleDeleteConfirm = async () => {
        if (!idToDelete || !tkToDelete) return;
        if (idToDelete === 'NV001') {
            toast.error("Không thể xóa nhân viên này!");
            setIsDeleteModalOpen(false);
            return;
        }
        try {
            const response = await staffApi.deleteFull(idToDelete);

            toast.success(response.data.message || "Xóa nhân viên thành công!");
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error: any) {
            // HỨNG LỖI TỪ BACKEND
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Thao tác thất bại, vui lòng kiểm tra lại!");
            }
        }
    };


    const getChiNhanhName = (branchCode: string) => {
        //check khoảng trắng khi api trả về
        switch (branchCode?.trim()) {
            case "CN001": return "30Shine - Nguyễn Trãi";
            case "CN002": return "30Shine - Cầu Giấy";
            case "CN003": return "30Shine - Tân Bình";
            case "CN004": return "30Shine - Đà Nẵng";
            default: return "Không xác định";
        }
    };
    //css theo chi nhánh
    const branchStyles: Record<string, React.CSSProperties> = {
        "CN001": { backgroundColor: '#fff1f0', color: '#f5222d' },
        "CN002": { backgroundColor: '#e6f7ff', color: '#1890ff' },
        "CN003": { backgroundColor: '#f6ffed', color: '#52c41a' },
        "CN004": { backgroundColor: '#fff7e6', color: '#fa8c16' },
    };
    const roleStyles: Record<string, React.CSSProperties> = {
        "Admin": { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' }, // Admin
        "Quản lý": { backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }, // Quản lý
        "Stylist": { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }, // Stylist
        "Thu ngân": { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' }, // Thu ngân
        "Lễ tân": { backgroundColor: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' }, // Lễ tân
    };

    //Định nghĩa cột cho DataTable theo api trả về
    const staffColumns: Column<NhanVien>[] = [
        { tieude: "ID", cotnhandulieu: "MANV" },
        { tieude: "Họ tên", cotnhandulieu: "HOTEN" },
        {
            tieude: "Chức vụ", cotnhandulieu: "CHUCVU", render: (row) => {
                const style = roleStyles[row.CHUCVU || ''] || {};
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        ...style
                    }}>
                        {style ? row.CHUCVU : "Không xác định"}
                    </span>
                )
            }
        },
        { tieude: "SĐT", cotnhandulieu: "SDT" },
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
        {
            tieude: "Ngày sinh", cotnhandulieu: "NGAYSINH", render: (row) => {
                const date = new Date(row.NGAYSINH);
                return date.toLocaleDateString('vi-VN');
            }
        },

        {
            tieude: "Hành động", cotnhandulieu: "MANV", render: (row) => (
                <>
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

    //HÀM RENDER FORM CHUNG CHO CẢ THÊM VÀ SỬA
    const renderFormContent = () => (
        <>
            <div className="form-group">
                <label htmlFor="staffID">Mã nhân viên:</label>
                <input
                    type="text"
                    id="staffID"
                    placeholder="Nhập mã nhân viên..."
                    value={formData.staffID}
                    onChange={handleChange}
                    disabled={modalType === 'edit'}
                />
                {formErrors.staffID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffID}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="staffName">Họ và tên:</label>
                <input
                    type="text"
                    id="staffName"
                    placeholder="Nhập họ tên..."
                    value={formData.staffName}
                    onChange={handleChange}
                />
                {formErrors.staffName && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffName}</span>}
            </div>
            <div className="form-group">
                <label>Chức vụ:</label>
                <select id="staffPosition" value={formData.staffPosition} onChange={handleChange}>
                    <option value="">-- Chọn chức vụ --</option>
                    <option value="Stylist">Stylist</option>
                    <option value="Thu ngân">Thu ngân</option>
                    <option value="Lễ tân">Lễ tân</option>
                    <option value="Quản lý">Quản lý</option>
                </select>
                {formErrors.staffPosition && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffPosition}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="staffPhone">Số điện thoại:</label>
                <input
                    type="text"
                    id="staffPhone"
                    maxLength={10}
                    placeholder="Nhập số điện thoại..."
                    value={formData.staffPhone}
                    disabled={modalType === 'edit'}
                    onChange={(e) => {

                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        handleChange(e);
                    }}
                />
                {formErrors.staffPhone && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffPhone}</span>}
            </div>
            <div className="form-group">
                <label>Địa chỉ:</label>
                <input type="text" id="staffAddress" placeholder="Nhập địa chỉ nhân viên" value={formData.staffAddress} onChange={handleChange} />
                {formErrors.staffAddress && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffAddress}</span>}
            </div>
            <div className="form-group">
                <label>Ngày sinh:</label>
                <input type="date" id="staffBirthDate" value={formData.staffBirthDate} onChange={handleChange} />
                {formErrors.staffBirthDate && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffBirthDate}</span>}
            </div>


            <div hidden = {modalType === 'add'} className="form-group">
                <label htmlFor="staffAcc">Tài khoản:</label>
                <input
                    type="text"
                    id="staffAcc"
                    placeholder="Nhập mã tài khoản..."
                    value={formData.staffAcc}
                    disabled={modalType === 'edit'}
                    onChange={handleChange}
                />
                {formErrors.staffAcc && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffAcc}</span>}
            </div>
            <div className="form-group">
                <label>Chi nhánh:</label>
                <select id="staffBranch" value={formData.staffBranch} onChange={handleChange}>
                    <option value="">-- Chọn chi nhánh --</option>
                    <option value="CN001">30Shine - Nguyễn Trãi</option>
                    <option value="CN002">30Shine - Cầu Giấy</option>
                    <option value="CN003">30Shine - Tân Bình</option>
                    <option value="CN004">30Shine - Đà Nẵng</option>
                </select>
                {formErrors.staffBranch && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.staffBranch}</span>}
            </div>
            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );

    return (
        <>
            <div id="accounts" className="section">
                <div className="panel header-actions">
                    <h2>Nhân viên</h2>
                    <button className="btn primary" onClick={handleOpenAdd}>Thêm nhân viên</button>
                </div>
                <div className="panel">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <DataTable<NhanVien> columns={staffColumns} data={filteredStaffList} isLoading={isLoading} />
                </div>
                {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
                <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới nhân viên" : "Sửa thông tin nhân viên"}>
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>

                {/* Modal xóa */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                    <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{idToDelete}</strong> không?</p><br />
                    <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
                </Modal>
            </div>
        </>
    );
};

export default StaffPage;