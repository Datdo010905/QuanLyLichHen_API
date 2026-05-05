import "../../assets/css/lichsu.css";
import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { toast } from 'react-toastify';
import DataTable, { Column } from '../../components/ui/DataTable';
import bookingApi, { Booking, BookingDetails } from "../../api/bookingApi";
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import staffApi, { NhanVien } from "../../api/staffApi";

const LichSuPage = () => {

	//check đã đăng nhập
	const user = localStorage.getItem("username");
	const role = localStorage.getItem("phanquyen");

	const [modalType, setModalType] = useState<'add' | 'addDetails' | 'edit' | 'none'>('none');
	const [IDtoView, setIDtoView] = useState<string | null>(null); // Lưu ID cần xem chi tiết
	const [viewDetailsList, setViewDetailsList] = useState<BookingDetails[]>([]);

	//Dữ liệu
	const [bookingList, setBookingList] = useState<Booking[]>([]);
	const [dichVuList, setDichVuList] = useState<DichVu[]>([]);
	const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);

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
	//up data từ api lên bảng
	const fetchData = async () => {
		try {
			if (user) {
				const resBooking = await bookingApi.getAllByIdKH(user);
				;
				setBookingList(resBooking.data.data);

				const resBookingDetails = await bookingApi.getAllCT();

				const resDichVu = await dichVuApi.getAll();
				const resNhanVien = await staffApi.getAll();
				if (resDichVu.data.success) {
					setDichVuList(resDichVu.data.data);
				}
				if (resNhanVien.data.success) {
					setNhanVienList(resNhanVien.data.data);
				}
			}
		} catch (err) {
			toast.error("Không thể tải dữ liệu lịch sử lịch hẹn.");
		}
	};
	// Tải dữ liệu khi component mount
	useEffect(() => {
		if (user || role) {
			fetchData();
		}
	}, []);

	useEffect(() => {
		// kiểm tra khi bookingList đã fetch
		if (bookingList && bookingList.length > 0) {
			const checkDangCho = bookingList.filter(lh => lh.TRANGTHAI.trim() === "Đang chờ");

			if (checkDangCho.length > 0) {
				toast.info("Bạn có lịch hẹn đã được duyệt, hãy đến dùng dịch vụ!", {
					toastId: 'thong-bao-dang-cho' //chỉ hiện 1 lần dù có nhiều lịch hẹn đang chờ
				});
			}
		}
	}, [bookingList]); // Chạy khi bookingList thay đổi

	if (!user && !role) {
		return <Navigate to="/login" replace />;
	}

	const handleViewClick = async (row: Booking) => {
		try {
			setIDtoView(row.MALICH?.trim() || null);

			const view = await bookingApi.getByIdCT(row.MALICH?.trim() || '');
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
		switch (branchCode) {
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

	//xử lý thay đổi form
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		// Cập nhật dữ liệu người dùng nhập vào formData
		setFormDataDetails((prev) => ({ ...prev, [id]: value }));
		setFormDataTK((prev) => ({ ...prev, [id]: value }));
	};
	const handleDeleteClick = (row: Booking) => {
		setFormData({
			bookingID: row.MALICH?.trim() || '',
			customerID: row.MAKH?.trim() || '',
			branchID: row.MACHINHANH?.trim() || '',
			bookingTime: row.GIOHEN?.trim() || '',
			bookingDate: row.NGAYHEN ? row.NGAYHEN.split('T')[0] : '',
			status: row.TRANGTHAI?.trim() || '',
			dichvu: '', //tạm để trống
			soluong: '', //tạm để trống
			nhanvien: '' //tạm để trống
		});
		setFormDataDetails({
			bookingID: '',
			branchID: '',
			dichvu: '',
			soluong: '',
			giadukien: '',
			nhanvien: '',
			ghichu: '',
		});

		setModalType('edit');
	};

	// huỷ lịch
	const handleDeleteConfirm = async (e: React.FormEvent) => {
		e.preventDefault();
		//tạo FormData theo swagger
		const submitData = new FormData();

		const trangthaiHienTai = bookingList.find(b => b.MALICH?.trim() === formData.bookingID)?.TRANGTHAI?.trim();
		try {
			if (modalType === 'edit') {
				if (formDataDetails.ghichu === '') {
					toast.info("Vui lòng ghi lý do huỷ lịch của bạn!");
					return;
				}
				if (trangthaiHienTai !== "Đã đặt" && trangthaiHienTai !== "Đang chờ") {
					toast.error("Chỉ có thể huỷ lịch khi lịch hẹn ở trạng thái 'Đã đặt' hoặc 'Đang chờ'!");
					return;
				}
				await bookingApi.updateCT(formData.bookingID, formDataDetails.ghichu);
				await bookingApi.update(formData.bookingID, "Đã huỷ");
				toast.success("Huỷ lịch hẹn thành công!");
			}
			setModalType('none'); // Đóng form
			fetchData(); // Tải lại dữ liệu
		} catch (error) {
			console.error("Lỗi:", error);
			toast.error("Thao tác thất bại, vui lòng kiểm tra lại!");
		}
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
						{style ? row.TRANGTHAI?.trim() : "Không xác định"}
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
					<button
						className="btn small delete"
						onClick={() => handleDeleteClick(row)}
						disabled={row.TRANGTHAI?.trim() === "Đã huỷ" || row.TRANGTHAI?.trim() === "Hoàn thành"}
						title={row.TRANGTHAI?.trim() === "Đã huỷ" || row.TRANGTHAI?.trim() === "Hoàn thành" ? "Không thể huỷ lịch đã hoàn thành hoặc đã huỷ" : "Huỷ lịch hẹn"}
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
				return nv ? `${nv.HOTEN} (${nv.SDT})` : "Không xác định";
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

	return (
		<>
			<div id="lichsu-container">
				<div className="lichsu-box">
					<h1>LỊCH SỬ LỊCH HẸN CỦA BẠN</h1>
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

					<table className="lichsu-table">
						<DataTable<Booking> columns={bookingColumns} data={bookingList} />
					</table>

					{/* CHỈ RENDER KHU VỰC NÀY NẾU IDtoView CÓ GIÁ TRỊ */}
					{IDtoView && (
						<div id="booking-details" className="booking-details" style={{ display: 'block' }}>

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
							/>

						</div>
					)}
				</div>
				<Modal isOpen={modalType === 'edit'} onClose={() => setModalType('none')} title="Bạn có chắc chắn huỷ lịch hẹn này?">
					<form className="service-form" onSubmit={handleDeleteConfirm}>
						<div className="form-group">
							<label htmlFor="ghichu">Nhập lý do huỷ lịch của bạn:</label>
							<input id="ghichu" value={formDataDetails.ghichu} onChange={handleChange} />
						</div>
						<button className="btn small delete" onClick={handleDeleteConfirm}><i className="fas fa-trash"></i> Xác nhận</button>
					</form>
				</Modal>
			</div >
		</>
	);
}


export default LichSuPage;