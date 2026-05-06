import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import khuyenmaiApi, { KhuyenMai } from "../../api/khuyenmaiApi";
import { khuyenMaiSchema } from "../../utils/khuyenmaiSchema"

const KhuyenMaiPage = () => {
    //khởi tạo state
    //Gộp state
    const [modalType, setModalType] = useState<'add' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa

    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();

    //Dữ liệu
    const [khuyenmaiList, setkhuyenmaiList] = useState<KhuyenMai[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});



    const [formData, setFormData] = useState({

        promotionID: '',
        promotionName: '',
        promotionDesc: '',
        promotionBD: '',
        promotionKT: '',
        promotionValue: '0',
        promotionStatus: ''
    });


    const filteredkhuyenmaiList = khuyenmaiList.filter(km =>
        km.MAKM?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        km.TRANGTHAI?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        km.NGAYBD?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        km.NGAYKT?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await khuyenmaiApi.getAll();

            setkhuyenmaiList(res.data.data);
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
            promotionID: '',
            promotionName: '',
            promotionDesc: '',
            promotionBD: '',
            promotionKT: '',
            promotionValue: '0',
            promotionStatus: ''
        });
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };
    //click vào sửa thì đẩy data lên form
    const handleEditClick = (row: KhuyenMai) => {
        setFormData({
            promotionID: row.MAKM ? row.MAKM.trim() : '',
            promotionName: row.TENKM ? row.TENKM.trim() : '',
            promotionDesc: row.MOTA ? row.MOTA.trim() : '',
            promotionBD: row.NGAYBD ? row.NGAYBD.split('T')[0] : '',
            promotionKT: row.NGAYKT ? row.NGAYKT.split('T')[0] : '',
            promotionValue: row.GIATRI ? row.GIATRI.toString() : '0',
            promotionStatus: row.TRANGTHAI ? row.TRANGTHAI.trim() : '',
        });
        setFormErrors({});
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
    const handleDeleteClick = (row: KhuyenMai) => {
        if (row.TRANGTHAI !== 'Hết hạn') {
            toast.error('Lỗi: Chỉ có thể xóa khuyến mại khi trạng thái là "Hết hạn"!');
            return;
        }
        setIdToDelete(row.MAKM.trim());
        setIsDeleteModalOpen(true);
    };

    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        //Kiểm tra dữ liệu với Zod
        const validationResult = khuyenMaiSchema.safeParse(formData);

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

        const currentDate = new Date();
        const endDate = new Date(formData.promotionKT);
        const startDate = new Date(formData.promotionBD);
        const autoStatus = endDate < currentDate ? 'Hết hạn' : startDate > currentDate ? 'Chưa áp dụng' : 'Đang áp dụng';

        // Cập nhật trạng thái vào formData
        setFormData((prev) => ({ ...prev, promotionStatus: autoStatus }));


        // //tạo FormData theo swagger
        // const submitData = new FormData();
        // submitData.append('MaKM', formData.promotionID);
        // submitData.append('TenKM', formData.promotionName);
        // submitData.append('MoTa', formData.promotionDesc);
        // submitData.append('NgayBD', formData.promotionBD);
        // submitData.append('NgayKT', formData.promotionKT);
        // submitData.append('GiaTri', formData.promotionValue);
        // submitData.append('TrangThai', autoStatus);



        // TẠO JSON ĐỂ GỬI LÊN
        const submitData: KhuyenMai = {
            MAKM: formData.promotionID,
            TENKM: formData.promotionName,
            MOTA: formData.promotionDesc,
            NGAYBD: formData.promotionBD,
            NGAYKT: formData.promotionKT,
            GIATRI: Number(formData.promotionValue),
            TRANGTHAI: autoStatus
        };
        try {
            if (modalType === 'add') {
                await khuyenmaiApi.create(submitData);
                toast.success("Thêm khuyến mại thành công!");
            } else {
                await khuyenmaiApi.update(formData.promotionID, submitData);
                toast.success("Cập nhật khuyến mại thành công!");
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
        if (!idToDelete) return;
        try {
            await khuyenmaiApi.delete(idToDelete);
            toast.success("Xóa khuyến mại thành công!");
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
    const status: Record<string, React.CSSProperties> = {
        'Hết hạn': { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' },
        'Đang áp dụng': { backgroundColor: '#e6f7ff', color: '#52c41a', border: '1px solid #b7eb8f' },
        'Chưa áp dụng': { backgroundColor: '#fffbe6', color: '#faad14', border: '1px solid #ffe58f' },
    };
    //Định nghĩa cột cho DataTable theo api trả về
    const taiKhoanColumns: Column<KhuyenMai>[] = [
        { tieude: "ID", cotnhandulieu: "MAKM" },
        { tieude: "Tên chương trình", cotnhandulieu: "TENKM" },
        { tieude: "Mô tả", cotnhandulieu: "MOTA" },
        {
            tieude: "Ngày bắt đầu", cotnhandulieu: "NGAYBD", render: (row) => {
                const date = new Date(row.NGAYBD);
                return date.toLocaleDateString('vi-VN');
            }
        },
        {
            tieude: "Ngày kết thúc", cotnhandulieu: "NGAYKT", render: (row) => {
                const date = new Date(row.NGAYKT);
                return date.toLocaleDateString('vi-VN');
            }
        },
        {
            tieude: "Giá trị", cotnhandulieu: "GIATRI", render(row) {
                return `${row.GIATRI}%`;
            },
        },
        {
            tieude: "Trạng thái", cotnhandulieu: "TRANGTHAI", render: (row) => {
                const codeStatus = row.TRANGTHAI;
                const style = status[codeStatus];

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
            tieude: "Hành động", cotnhandulieu: "MAKM", render: (row) => (
                <>
                    <button className="btn small edit" onClick={() => handleEditClick(row)}><i className="fas fa-edit"></i></button>
                    <button
                        className="btn small delete"
                        onClick={() => handleDeleteClick(row)}
                        title="Chỉ xoá những khuyến mại đã hết hạn!"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </>
            )
        },
    ];
    // HÀM RENDER FORM CHUNG CHO CẢ THÊM VÀ SỬA
    const renderFormContent = () => (
        <>
            <div className="form-group">
                <label htmlFor="promotionID">Mã khuyến mại:</label>
                <input
                    type="text"
                    id="promotionID"
                    placeholder="VD: KM001"
                    value={formData.promotionID} // Thêm value
                    onChange={handleChange}
                />
                {formErrors.promotionID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionID}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="promotionName">Tên chương trình:</label>
                <input
                    type="text"
                    id="promotionName"
                    placeholder="VD: Giảm giá mùa hè"
                    value={formData.promotionName}
                    onChange={handleChange}
                />
                {formErrors.promotionName && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionName}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="promotionDesc">Mô tả:</label>
                <textarea
                    id="promotionDesc"
                    rows={3}
                    value={formData.promotionDesc}
                    onChange={handleChange}
                ></textarea>
                {formErrors.promotionDesc && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionDesc}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="promotionBD">Ngày bắt đầu:</label>
                <input
                    type="date"
                    id="promotionBD"
                    value={formData.promotionBD}
                    onChange={handleChange}
                />
                {formErrors.promotionBD && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionBD}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="promotionKT">Ngày kết thúc:</label>
                <input
                    type="date"
                    id="promotionKT"
                    value={formData.promotionKT}
                    onChange={handleChange}
                />
                {formErrors.promotionKT && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionKT}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="promotionValue">Giá trị giảm (%):</label>
                <input
                    type="number"
                    id="promotionValue"
                    value={formData.promotionValue}
                    onChange={handleChange}
                />
                {formErrors.promotionValue && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.promotionValue}</span>}
            </div>
            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );
    return (
        <>

            <div id="promotions" className="section">
                <div className="panel header-actions">
                    <h2>Khuyến mại</h2>
                    <button className="btn primary" onClick={handleOpenAdd}>Thêm khuyến mại</button>
                </div>
                <div className="panel">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <DataTable<KhuyenMai> columns={taiKhoanColumns} data={filteredkhuyenmaiList} isLoading={isLoading} />
                </div>
                {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
                <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới khuyến mại" : "Sửa thông tin khuyến mại"}>
                    <form className="service-form" onSubmit={handleSubmitForm}>
                        {renderFormContent()}
                    </form>
                </Modal>

                {/* Modal xóa */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                    <p>Bạn có chắc chắn muốn xóa khuyến mại <strong>{idToDelete}</strong> không?</p><br />
                    <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
                </Modal>
            </div>
        </>
    );
};

export default KhuyenMaiPage;