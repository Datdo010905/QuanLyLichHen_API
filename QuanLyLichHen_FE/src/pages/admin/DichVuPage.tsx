import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import DataTable, { Column } from '../../components/ui/DataTable';
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import { dichVuSchema } from '../../utils/dichVuSchema';
import { useSearch } from '../../context/SearchContext';
import { toast } from 'react-toastify';

const DichVuPage: React.FC = () => {
    //Gộp state
    const [modalType, setModalType] = useState<'add' | 'edit' | 'none'>('none');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null); // Lưu ID cần xóa

    //State dùng chung cho tìm kiếm
    const { searchTerm } = useSearch();

    //Dữ liệu dịch vụ
    const [dichVuList, setDichVuList] = useState<DichVu[]>([]);
    const [dichVuCSDList, setDichVuCSDList] = useState<DichVu[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    //Form data và lỗi
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        serviceID: '', serviceName: '', serviceType: 'CT',
        serviceDesc: '', serviceTime: '', servicePrice: '',
        serviceStatus: 'Đang cung cấp', serviceProcedure: '',
    });
    //Xử lý preview ảnh
    const [previewImg, setPreviewImg] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);


    const filteredDichVuList = dichVuList.filter(dv =>
        dv.TENDV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dv.MADV?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDichVuCSDList = dichVuCSDList.filter(dv =>
        dv.TENDV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dv.MADV?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //up data từ api lên bảng
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [resToc, resCSD] = await Promise.all([
                dichVuApi.getAll(),
                dichVuApi.getAllCSD()
            ]);
            setDichVuList(resToc.data.data);
            setDichVuCSDList(resCSD.data.data);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImg(URL.createObjectURL(file));

            //Tự động xóa lỗi nếu đã chọn ảnh
            if (formErrors.serviceImg) {
                setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.serviceImg;
                    return newErrors;
                });
            }
        }

    };

    // Chuẩn bị form rỗng khi Thêm 
    const handleOpenAdd = () => {
        setFormData({
            serviceID: '', serviceName: '', serviceType: 'CT',
            serviceDesc: '', serviceTime: '', servicePrice: '',
            serviceStatus: 'Đang cung cấp', serviceProcedure: '',
        });
        setPreviewImg('');
        setImageFile(null);
        setFormErrors({}); // Xóa lỗi cũ
        setModalType('add');
    };

    //click nút sửa
    const handleEditClick = (row: DichVu) => {
        setFormData({
            serviceID: row.MADV || '',
            serviceName: row.TENDV || '',
            serviceType: row.LOAI || 'CT',
            serviceDesc: row.MOTA || '',
            serviceTime: row.THOIGIAN ? String(row.THOIGIAN) : '',
            servicePrice: row.GIADV ? String(row.GIADV) : '',
            serviceStatus: row.TRANGTHAI || 'Đang cung cấp',
            serviceProcedure: row.QUYTRINH || '',
        });
        setPreviewImg(row.HINH ? (row.HINH.startsWith('/') ? row.HINH : `/${row.HINH}`) : '');
        setFormErrors({}); // Xóa lỗi cũ
        setImageFile(null);
        setModalType('edit');

    };
    const handleDeleteClick = (row: DichVu) => {
        if (row.TRANGTHAI !== 'Ngừng cung cấp') {
            toast.error('Lỗi: Chỉ có thể xóa dịch vụ khi trạng thái là "Ngừng cung cấp"!');
            return;
        }
        setIdToDelete(row.MADV);
        setIsDeleteModalOpen(true);
    };

    //HÀM SUBMIT CHO CẢ THÊM VÀ SỬA
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        //Kiểm tra dữ liệu với Zod
        const validationResult = dichVuSchema.safeParse(formData);

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
        //tạo FormData để gửi kèm file ảnh
        const submitData = new FormData();
        submitData.append('maDV', formData.serviceID);
        submitData.append('tenDV', formData.serviceName);
        submitData.append('moTa', formData.serviceDesc);
        submitData.append('thoiGian', String(formData.serviceTime));
        submitData.append('giaDV', String(formData.servicePrice));
        submitData.append('trangThai', formData.serviceStatus);
        submitData.append('quyTrinh', formData.serviceProcedure);
        submitData.append('loai', formData.serviceType);

        if (imageFile) submitData.append('fileAnh', imageFile);
        if (!imageFile) {
            setFormErrors((prev) => ({ ...prev, serviceImg: "Vui lòng chọn ảnh cho dịch vụ!" }));
            return;
        }
        try {
            if (modalType === 'add') {

                await dichVuApi.create(submitData);
                toast.success("Thêm dịch vụ thành công!");
            } else {
                await dichVuApi.update(submitData);
                toast.success("Cập nhật dịch vụ thành công!");
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

    // Xoá dịch vụ
    const handleDeleteConfirm = async () => {
        if (!idToDelete) return;
        try {
            await dichVuApi.delete(idToDelete);
            toast.success("Xóa dịch vụ thành công!");
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
        'Ngừng cung cấp': { backgroundColor: '#fff1f0', color: '#f5222d', border: '1px solid #ffa39e' },
        'Đang cung cấp': { backgroundColor: '#e6f7ff', color: '#52c41a', border: '1px solid #b7eb8f' },
    };

    //Định nghĩa cột cho DataTable
    const dichVuColumns: Column<DichVu>[] = [
        { tieude: "ID", cotnhandulieu: "MADV" },
        { tieude: "Tên dịch vụ", cotnhandulieu: "TENDV" },
        { tieude: "Thời gian", cotnhandulieu: "THOIGIAN", render: (row) => `${row.THOIGIAN} phút` },
        {
            tieude: "Giá", cotnhandulieu: "GIADV", render: (row) => {
                const value = parseFloat(row.GIADV as any);
                return value ? value.toLocaleString('vi-VN') + '₫' : "0₫";
            }

        },
        {
            tieude: "Trạng thái", cotnhandulieu: "TRANGTHAI", render: (row) => {
                const codeStatus = row.TRANGTHAI;
                const style = status[codeStatus] || status['Đang cung cấp'];

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
            tieude: "Ảnh", cotnhandulieu: "HINH", render: (row) => {
                const imgPath = row.HINH?.startsWith('/') ? row.HINH : `/${row.HINH}`;
                return row.HINH ? <img src={imgPath} alt={row.TENDV} height="60" width="70" style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ color: '#999', fontSize: '12px' }}>Không có ảnh</span>;
            }
        },
        {
            tieude: "Hành động", cotnhandulieu: "MADV", render: (row) => (
                <>
                    <button className="btn small edit" onClick={() => handleEditClick(row)}><i className="fas fa-edit"></i></button>
                    <button
                        className="btn small delete"
                        onClick={() => handleDeleteClick(row)}
                        title="Chỉ xoá những dịch vụ đã ngừng cung cấp!"
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
                <label htmlFor="serviceID">Mã dịch vụ:</label>
                {/* Khóa input ID nếu đang sửa */}
                <input type="text" id="serviceID" disabled={modalType === 'edit'} placeholder="VD: CSD001" value={formData.serviceID} onChange={handleChange} />
                {formErrors.serviceID && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.serviceID}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="serviceName">Tên dịch vụ:</label>
                <input type="text" id="serviceName" value={formData.serviceName} onChange={handleChange} />
                {formErrors.serviceName && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.serviceName}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="serviceType">Loại dịch vụ:</label>
                <select id="serviceType" value={formData.serviceType} onChange={handleChange}>
                    <option value="CT">Dịch vụ tóc</option>
                    <option value="CSD">Chăm sóc da</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="serviceDesc">Mô tả:</label>
                <textarea id="serviceDesc" rows={3} value={formData.serviceDesc} onChange={handleChange} />
                {formErrors.serviceDesc && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.serviceDesc}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="serviceTime">Thời gian (phút):</label>
                <input type="number" id="serviceTime" value={formData.serviceTime} onChange={handleChange} />
                {formErrors.serviceTime && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.serviceTime}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="servicePrice">Giá (VND):</label>
                <input type="number" id="servicePrice" value={formData.servicePrice} onChange={handleChange} />
                {formErrors.servicePrice && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.servicePrice}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="serviceStatus">Trạng thái:</label>
                <select id="serviceStatus" value={formData.serviceStatus} onChange={handleChange}>
                    <option value="Đang cung cấp">Đang cung cấp</option>
                    <option value="Ngừng cung cấp">Ngừng cung cấp</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="serviceImg">Ảnh (Chọn để thay đổi):</label>
                {formErrors.serviceImg && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.serviceImg}</span>}
                <input type="file" accept="image/*" id="serviceImg" onChange={handleImageChange} />
                {previewImg && <img src={previewImg} alt="Preview" style={{ marginTop: '10px', maxWidth: '200px' }} />}
            </div>
            <div className="form-group">
                <label htmlFor="serviceProcedure">Quy trình:</label>
                <textarea id="serviceProcedure" rows={3} value={formData.serviceProcedure} onChange={handleChange} />
            </div>
            <button type="submit" className="btn primary">{modalType === 'add' ? 'Lưu mới' : 'Cập nhật'}</button>
        </>
    );

    return (
        <div id="services" className="section">
            <div className="panel header-actions">
                <h2>Dịch vụ</h2>
                <button className="btn primary" onClick={handleOpenAdd}>Thêm dịch vụ</button>
            </div>

            <div className="panel">
                <h3>Tóc</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <DataTable<DichVu> columns={dichVuColumns} data={filteredDichVuList} isLoading={isLoading} />
            </div>

            <div className="panel">
                <h3>Chăm sóc da & Thư giãn</h3>
                <DataTable<DichVu> columns={dichVuColumns} data={filteredDichVuCSDList} isLoading={isLoading} />
            </div>

            {/* DÙNG CHUNG MODAL CHO CẢ THÊM VÀ SỬA */}
            <Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title={modalType === 'add' ? "Thêm mới dịch vụ" : "Sửa thông tin dịch vụ"}>
                <form className="service-form" onSubmit={handleSubmitForm}>
                    {renderFormContent()}
                </form>
            </Modal>

            {/* Modal xóa */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận Xóa">
                <p>Bạn có chắc chắn muốn xóa dịch vụ mã <strong>{idToDelete}</strong> không?</p><br />
                <button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xóa ngay</button>
            </Modal>
        </div>
    );
};

export default DichVuPage;