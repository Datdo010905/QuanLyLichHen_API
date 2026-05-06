import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import taikhoanApi, { TaiKhoan } from "../../api/taikhoanApi";
import { taiKhoanSchema } from "../../utils/taiKhoanSchema";
const AccountPage: React.FC = () => {
    //khởi tạo state
    //Gộp state
    const [modalType, setModalType] = useState<'add' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa

    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();

    //Dữ liệu tài khoản
    const [taikhoanList, settaikhoanList] = useState<TaiKhoan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        accUsername: '',
        accPassword: '',
        accRole: '0',
        accStatus: 'Hoạt động'
    });

    const filteredtaikhoanList = taikhoanList.filter(tk =>
        tk.MATK?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tk.TRANGTHAI?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resTaiKhoan = await taikhoanApi.getAll();

            settaikhoanList(resTaiKhoan.data.data);
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
            accUsername: '',
            accPassword: '',
            accRole: '0',
            accStatus: 'Hoạt động'
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };
    //click nút sửa
    const handleEditClick = (row: TaiKhoan) => {
        setFormData({
            accUsername: row.MATK ? row.MATK.trim() : '',
            accPassword: row.PASS ? row.PASS.trim() : '',
            accRole: row.PHANQUYEN ? String(row.PHANQUYEN) : '',
            accStatus: row.TRANGTHAI ? row.TRANGTHAI.trim() : 'Hoạt động',
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
    const handleDeleteClick = (row: TaiKhoan) => {
        if (row.TRANGTHAI !== 'Khoá') {
            toast.error('Lỗi: Chỉ có thể xóa tài khoản khi trạng thái là "Khoá"!');
            return;
        }
        setIdToDelete(row.MATK);
        setIsDeleteModalOpen(true);
    };
    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        //Kiểm tra dữ liệu với Zod
        const validationResult = taiKhoanSchema.safeParse(formData);

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
        // submitData.append('MaTK', formData.accUsername);
        // submitData.append('Pass', formData.accPassword);
        // submitData.append('PhanQuyen', formData.accRole);
        // submitData.append('TrangThai', formData.accStatus);
        const submitData = {
            MATK: formData.accUsername,
            PASS: formData.accPassword,
            PHANQUYEN: Number(formData.accRole),
            TRANGTHAI: formData.accStatus
        };

        try {
            if (modalType === 'add') {

                await taikhoanApi.create(submitData);
                toast.success("Thêm tài khoản thành công!");

            } else {
                await taikhoanApi.update(formData.accUsername, submitData);
                toast.success("Cập nhật tài khoản thành công!");
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

    // xoá tài khoản
    const handleDeleteConfirm = async () => {
        if (!idToDelete) return;
        try {
            await taikhoanApi.delete(idToDelete);
            toast.success("Xóa tài khoản thành công!");
            setIsDeleteModalOpen(false);
            fetchData(); // Load lại bảng
        } catch (error: any) {
            // HỨNG LỖI TỪ BACKEND
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Thao tác thất bại, vui lòng kiểm tra lại!");
            }
        }
    };

    // Hàm tiện ích: Trả về chữ "Quản lý", "Nhân viên"... dựa theo mã PHANQUYEN
    const getRoleName = (roleCode: number) => {
        switch (roleCode) {
            case 1: return "Admin";
            case 2: return "Quản lý";
            case 3: return "Stylist";
            case 4: return "Thu ngân";
            case 5: return "Lễ tân";
            case 0: return "Khách hàng";
            default: return "Không xác định";
        }
    };

    const roleStyles: Record<number, React.CSSProperties> = {
        1: { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' }, // Admin
        2: { backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }, // Quản lý
        3: { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }, // Stylist
        4: { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' }, // Thu ngân
        5: { backgroundColor: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' }, // Lễ tân
        0: { backgroundColor: '#fafafa', color: '#595959', border: '1px solid #d9d9d9' }, // Khách hàng
    };

    const status: Record<string, React.CSSProperties> = {
        'Khoá': { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' },
        'Hoạt động': { backgroundColor: '#e6f7ff', color: '#52c41a', border: '1px solid #b7eb8f' },
    };

    const Mahoa = (pass: string) => {
        if (pass) {
            return '******';
        }
        return '';
    }
    //Định nghĩa cột cho DataTable theo api trả về
    const taiKhoanColumns: Column<TaiKhoan>[] = [
        { tieude: "Tài khoản", cotnhandulieu: "MATK" },
        { tieude: "Mật khẩu", cotnhandulieu: "PASS", render: (row) => Mahoa(row.PASS) },
        {
            tieude: "Quyền hạn", cotnhandulieu: "PHANQUYEN", render: (row) => {
                const roleCode = Number(row.PHANQUYEN);
                const roleName = getRoleName(roleCode);

                const style = roleStyles[roleCode] || roleStyles[0];

                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        ...style
                    }}>
                        {roleName}
                    </span>
                );
            }
        },
        {
            tieude: "Trạng thái", cotnhandulieu: "TRANGTHAI", render: (row) => {
                const codeStatus = row.TRANGTHAI;
                const style = status[codeStatus] || status['Hoạt động'];

                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '15px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        ...style
                    }}>
                        {codeStatus}
                    </span>
                )
            }
        },
        {
            tieude: "Hành động", cotnhandulieu: "MATK", render: (row) => (
                <>
                    <button className="btn small edit" onClick={() => handleEditClick(row)}><i className="fas fa-edit"></i></button>
                    <button
                        className="btn small delete"
                        onClick={() => handleDeleteClick(row)}
                        title="Chỉ xoá những tài khoản đã khoá!"
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
                <label htmlFor="accUsername">Tên đăng nhập:</label>
                <input type="text" id="accUsername" value={formData.accUsername} disabled={modalType === 'edit'} name="accUsername" onChange={handleChange} />
                {formErrors.accUsername && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.accUsername}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="accPassword">Mật khẩu:</label>
                <input disabled={modalType === 'edit'} type="password" id="accPassword" value={formData.accPassword} name="accPassword" onChange={handleChange} />
                {formErrors.accPassword && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.accPassword}</span>}

            </div>
            <div className="form-group">
                <label htmlFor="accRole">Quyền hạn:</label>
                <select id="accRole" value={formData.accRole} onChange={handleChange}>
                    <option value="0">Khách hàng</option>
                    <option value="2">Quản lý</option>
                    <option value="3">Stylist</option>
                    <option value="4">Thu ngân</option>
                    <option value="5">Lễ tân</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="accStatus">Trạng thái:</label>
                <select id="accStatus" value={formData.accStatus} onChange={handleChange}>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Khoá">Khoá</option>
                </select>
            </div>
            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );

    return (
        <>
            <div id="accounts" className="section">
                <div className="panel header-actions">
                    <h2>Tài khoản</h2>
                    <button className="btn primary" onClick={handleOpenAdd}>Thêm tài khoản</button>
                </div>
                <div className="panel">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <DataTable<TaiKhoan> columns={taiKhoanColumns} data={filteredtaikhoanList} isLoading={isLoading} />
                </div>
                {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
                <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới tài khoản" : "Sửa thông tin tài khoản"}>
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>

                {/* Modal xóa */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                    <p>Bạn có chắc chắn muốn xóa tài khoản <strong>{idToDelete}</strong> không?</p><br />
                    <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
                </Modal>
            </div>
        </>
    );
};

export default AccountPage;