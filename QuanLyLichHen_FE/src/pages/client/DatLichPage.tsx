import React, { useState, useEffect, useMemo } from "react";
import "../../assets/css/lichhen.css";
import { toast } from "react-toastify";
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import Modal from "../../components/ui/Modal";
import bookingApi, { Booking, BookingDetails } from "../../api/bookingApi";
import staffApi, { NhanVien } from "../../api/staffApi";
import TaiKhoanApi from "../../api/taikhoanApi";
const DatLichPage = () => {

	const [modalType, setModalType] = useState<'checkpass' | 'none'>('none');

	const getSDT = localStorage.getItem("username");
	const getName = localStorage.getItem("tenkhach");

	//dùng dv cần xem bằng state
	const [selectedDichVu, setSelectedDichVu] = useState<string>(localStorage.getItem("madvCanXem")?.trim() || "");

	//state lựa chọn
	const [dichVuList, setDichVuList] = useState<DichVu[]>([]);
	const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]); // Dữ liệu nhân viên để đổ vào select
	const [bookingList, setBookingList] = useState<Booking[]>([]);
	const [bookingDetailsList, setBookingDetailsList] = useState<BookingDetails[]>([]);

	const [matkhauCheck, setmatkhauCheck] = useState<string>("");

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
	//up data từ api
	const fetchDichVu = async () => {
		try {
			const resToc = await dichVuApi.getAllDichVuClient();
			if (resToc?.data?.success) {
				setDichVuList(resToc.data.data || []);
			}
		} catch (err) {
			toast.error("Không thể tải dữ liệu từ máy chủ.");
		}
	};

	const fetchData = async () => {
		try {
			const resNhanVien = await staffApi.getAll();
			const resBookingDetails = await bookingApi.getAllCT();

			if (resNhanVien?.data?.success) {
				setNhanVienList(resNhanVien.data.data || []);
			}
			if (resBookingDetails?.data?.success) {
				setBookingDetailsList(resBookingDetails.data.data || []);
			}

			const resBooking = await bookingApi.getAll();
			if (resBooking?.data?.success) {
				setBookingList(resBooking.data.data || []);
			}

		} catch (err) {
			toast.error("Không thể tải dữ liệu từ máy chủ.");
		}
	};

	// Tải dữ liệu khi component mount
	useEffect(() => {
		fetchDichVu();
		fetchData();
	}, []);

	//xử lý thay đổi form
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		// Cập nhật dữ liệu người dùng nhập vào formData
		setFormData((prev) => ({ ...prev, [id]: value }));
		setFormDataDetails((prev) => ({ ...prev, [id]: value }));
		setmatkhauCheck((prev) => id === "password" ? value : prev); // Cập nhật mật khẩu kiểm tra nếu trường thay đổi là password
	};
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

	const themlichhen = (e: React.FormEvent) => {
		e.preventDefault();
		//check mật khẩu trước rồi mới cho đặt lịch
		//hiện popup xác nhận mật khẩu
		if (!formData.bookingTime) {
			toast.error("Hãy chọn thời điểm cần đặt lịch!");
			return;
		}

		setModalType('checkpass');
	};
	const submitDatLich = async () => {

		if (!matkhauCheck) {
			toast.error("Mật khẩu không được để trống!");
			return;
		}

		try {
			const loggedUser = getSDT;
			if (loggedUser) {
				//tìm tk
				const resTaiKhoan = await TaiKhoanApi.getById(loggedUser);
				//console.log("Thông tin tài khoản:", resTaiKhoan);
				const thongTinTaiKhoan = resTaiKhoan.data.data;
				//console.log("Thông tin tài khoản sau khi lấy:", thongTinTaiKhoan);
				//check mk
				if (thongTinTaiKhoan.PASS.trim() !== matkhauCheck.trim()) {
					toast.error("Mật khẩu không chính xác! Vui lòng thử lại.");
					// console.log("Mật khẩu nhập vào:", matkhauCheck);
					// console.log("Mật khẩu thực tế:", thongTinTaiKhoan.PASS);

					return;
				}
				toast.success("Xác thực thành công! Đang xử lý đặt lịch...");
				// //tạo FormData theo swagger
				// const submitData = new FormData();

				// //tạo mã lịch mới theo format LH + timestamp + random 3 số để đảm bảo tính duy nhất
				// const maLichMoi = "LH" + Date.now() + Math.floor(Math.random() * 1000);

				// submitData.append('MaLich', maLichMoi);
				// submitData.append('NgayHen', formData.bookingDate);
				// submitData.append('GioHen', formData.bookingTime);
				// submitData.append('TrangThai', "Đã đặt");//mặc định
				// submitData.append('MaChiNhanh', formData.branchID);
				// //khách hàng là nick đang đăng nhập
				// submitData.append('MaKH', loggedUser);

				// const submitDataCT = new FormData();
				// submitDataCT.append('MaLich', maLichMoi);

				// submitDataCT.append('MaDV', selectedDichVu);
				// submitDataCT.append('MaNV', formData.nhanvien);
				// submitDataCT.append('SoLuong', formData.soluong || '1'); //mặc định 1 dịch vụ	

				// const dichVuSelected = dichVuList.find(dv => dv.MADV?.trim() === selectedDichVu);

				// submitDataCT.append('GiaDuKien', dichVuSelected ? dichVuSelected.GIADV.toString() : '0');
				// submitDataCT.append('GhiChu', formDataDetails.ghichu || 'Không có ghi chú');


				// Tạo mã lịch mới theo format LH + timestamp + random 3 số để đảm bảo tính duy nhất
				const maLichMoi = "LH" + Date.now() + Math.floor(Math.random() * 1000);

				// TẠO JSON CHO BẢNG (LỊCH HẸN)
				const submitData = {
					MALICH: maLichMoi,
					NGAYHEN: formData.bookingDate,
					GIOHEN: formData.bookingTime,
					TRANGTHAI: "Đã đặt", // Mặc định
					MACHINHANH: formData.branchID,
					MAKH: loggedUser // Khách hàng là nick đang đăng nhập
				};

				// Tìm dịch vụ để lấy giá dự kiến
				const dichVuSelected = dichVuList.find(dv => dv.MADV?.trim() === selectedDichVu?.trim());

				// TẠO JSON CHO BẢNG (CHI TIẾT LỊCH HẸN)
				const submitDataCT = {
					MALICH: maLichMoi,
					MADV: selectedDichVu?.trim(),
					MANV: formData.nhanvien?.trim(),
					SOLUONG: Number(formData.soluong || 1), //mặc định 1
					GIA_DUKIEN: dichVuSelected ? Number(dichVuSelected.GIADV) : 0,
					GHICHU: formDataDetails.ghichu || 'Không có ghi chú'
				};
				//gọi API tạo lịch hẹn và chi tiết lịch hẹn
				await bookingApi.create(submitData);
				await bookingApi.createCT(submitDataCT);

				toast.success("Đặt lịch thành công!");

				setModalType('none');
				setmatkhauCheck('');
				//chuyển hướng về trang lịch sử sau khi đặt lịch thành công
				setTimeout(() => {
					window.location.href = "/lichsu";
				}, 2000);
			}
		}
		catch (error) {
			console.error("Lỗi khi kiểm tra tài khoản:", error);
			toast.error("Đã xảy ra lỗi khi xác thực tài khoản!");
		}
	}

	return (
		<>
			<div className="datlich-page">
				<div className="datlich-form">
					<h1>ĐẶT LỊCH GIỮ CHỖ</h1>
					<form>
						<span>Họ và tên:<span style={{ color: "red" }}>*</span></span><br />
						<input readOnly id="hoten-dat" className="input-field" maxLength={50} type="text"
							placeholder="Nhập họ và tên của bạn"
							value={getName || ''} /><br />

						<span>Số điện thoại:<span style={{ color: "red" }}>*</span></span><br />
						<input type="text" readOnly maxLength={10} id="sdt-dat" className="input-field" placeholder="Nhập số"
							value={getSDT || ''}
						/>
						<br />
						<span>Dịch vụ:<span style={{ color: "red" }}>*</span></span><br />
						<select id="dichvu" className="input-field" value={selectedDichVu}
							onChange={(e) => setSelectedDichVu(e.target.value.trim())}
						>
							<option value="" disabled>-- Chọn dịch vụ --</option>
							{dichVuList?.map((dv) => (
								<option key={dv.MADV?.trim()} value={dv.MADV?.trim()}>
									{dv.TENDV} - {dv.THOIGIAN} phút - {dv.GIADV.toLocaleString()} VNĐ
								</option>
							))}
						</select>
						<br />
						<span>Chi nhánh:<span style={{ color: "red" }}>*</span></span><br />
						<select id="branchID" value={formData.branchID} onChange={handleChange} className="input-field">
							<option value="">-- Chọn chi nhánh --</option>
							<option value="CN001">30Shine - Nguyễn Trãi</option>
							<option value="CN002">30Shine - Cầu Giấy</option>
							<option value="CN003">30Shine - Tân Bình</option>
							<option value="CN004">30Shine - Đà Nẵng</option>
						</select>
						<br />


						<span>Thợ cắt tóc:<span style={{ color: "red" }}>*</span></span><br />
						<select id="nhanvien" className="input-field" value={formData.nhanvien} disabled={!formData.branchID} onChange={handleChange}>
							<option value="">-- Chọn nhân viên --</option>
							{/* lọc nhân viên theo chi nhánh đã chọn và chức vụ */}
							{nhanVienList?.filter((nv) => nv.MACHINHANH?.trim() === formData.branchID && nv.CHUCVU === "Stylist").map((nv) => (
								<option key={nv.MANV?.trim()} value={nv.MANV?.trim()}>
									{nv.MANV} - {nv.HOTEN} {`(${nv.SDT})`}
								</option>
							))}
						</select><br />



						<span>Ngày hẹn:<span style={{ color: "red" }}>*</span></span><br />
						<input id="bookingDate" className="input-field" type="date" value={formData.bookingDate} onChange={handleChange} /><br />

						<span>Giờ hẹn:<span style={{ color: "red" }}>*</span></span><br />
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
						<br /><br />
						<div className="form-group">
							<label htmlFor="ghichu">Ghi chú:</label>
							<textarea id="ghichu" rows={3} value={formDataDetails.ghichu} onChange={handleChange} />
						</div>


						<input id="btn-datlichpage" onClick={themlichhen} type="submit" value="ĐẶT LỊCH NGAY" />
					</form>
					<br />
					<p style={{ "textAlign": "center" }}>📅 Cắt xong trả tiền – Huỷ lịch không sao</p>

					<Modal isOpen={modalType !== 'none'} onClose={() => setModalType('none')} title="Nhập mật khẩu để tiếp tục">
						<label>Mật khẩu:</label>
						<div className="password-container">
							<input id="password" className="input-field" type="password" onChange={handleChange} value={matkhauCheck} placeholder="Mật khẩu" required />
						</div>
						<div className="form-actions">
							<button type="submit" className="btn primary" onClick={submitDatLich}>
								Xác nhận
							</button>
						</div>
					</Modal>
				</div>
			</div>
		</>
	);
};

export default DatLichPage;