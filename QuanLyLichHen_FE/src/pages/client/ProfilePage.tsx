import "../../assets/css/lichsu.css";
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import CustomerApi from "../../api/customerApi";
import TaiKhoanApi from "../../api/taikhoanApi";

const ProfilePage = () => {
	const [showPwd, setShowPwd] = useState(false);
	const [name, setName] = useState("");
	// Lấy thông tin đăng nhập
	const user = localStorage.getItem("username");

	// Dữ liệu form
	const [formData, setFormData] = useState({
		accUsername: '',
		accPassword: '',
		accRole: '0',
		accStatus: 'Hoạt động'
	});

	const [formDataKH, setFormDataKH] = useState({
		cusID: '',
		cusName: '',
		cusPhone: '',
		cusAcc: ''
	});
	// Lấy data từ API
	const fetchData = async () => {
		try {
			if (user) {
				const resKH = await CustomerApi.getById(user);
				if (resKH && resKH.data && resKH.data.success) {
					const customerData = Array.isArray(resKH.data.data)
						? resKH.data.data[0]
						: resKH.data.data;

					const tenGoc = customerData.HOTEN;
					setName(tenGoc);
					setFormDataKH((prev) => ({
						...prev,
						cusName: tenGoc
					}));
					setFormData((prev) => ({
                        ...prev,
						accUsername: user.trim(),
                        accRole: '0', 
                        accStatus: 'Hoạt động' 
                    }));

				} else {
					toast.error("Không tìm thấy thông tin khách hàng.");
				}
			}
		} catch (err) {
			toast.error("Không thể tải dữ liệu.");
		}
	};

	useEffect(() => {
		if (user) {
			fetchData();
		}
	}, [user]);

	if (!user) {
		return <Navigate to="/login" replace />;
	}
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		// Tùy theo ID mà cập nhật đúng State tương ứng
		if (id === "accPassword") {
			setFormData((prev) => ({ ...prev, [id]: value }));
		} else if (id === "cusName") {
			setFormDataKH((prev) => ({ ...prev, [id]: value }));
		}
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const finalName = formDataKH.cusName.trim();
		if (!finalName) {
			toast.warn("Họ tên không được để trống!");
			return;
		}

		try {

			
			//đổi tên
			const submitDataKH = {
				MAKH: formDataKH.cusPhone.trim(),
				HOTEN: formDataKH.cusName.trim(),
				SDT: formDataKH.cusPhone.trim(),
				MATK: formDataKH.cusPhone.trim()
			};

			await CustomerApi.update(user, submitDataKH);

			//check có thì đổi mật khẩu
			const newPass = formData.accPassword.trim();
			if (newPass) {
				//đổi mật khẩu
				const submitData = {
					MATK: formData.accUsername.trim(),
					PASS: formData.accPassword.trim(),
					PHANQUYEN: Number(formData.accRole),
					TRANGTHAI: formData.accStatus.trim()
				};
				await TaiKhoanApi.update(user, submitData);
			}

			toast.success("Cập nhật thông tin thành công!");
			// Cập nhật xong thì xóa rỗng ô mật khẩu
            setFormData(prev => ({ ...prev, accPassword: '' }));
		} catch (error) {
			console.error("Lỗi cập nhật:", error);
			toast.error("Cập nhật thất bại, vui lòng thử lại!");
		}
	}

	return (
		<>
			<div className="doimatkhau-page">
				<div className="doimatkhau-container">
					<div className="doimatkhau-left">
						<img src="/img/userProfile.jpg" alt="user" className="user" />
					</div>

					<div className="doimatkhau-right">
						<h1>THÔNG TIN KHÁCH HÀNG</h1>
						<form onSubmit={handleSubmit}>
							<label htmlFor="cusName">Họ và tên</label>
							<input
								id="cusName"
								type="text"
								placeholder="Họ và tên"
								value={formDataKH.cusName}
								onChange={handleChange}
							/>

							<label htmlFor="cusPhone">Số điện thoại</label>
							<input
								id="cusPhone"
								type="text"
								placeholder="Số điện thoại"
								maxLength={10}
								readOnly
								value={user.trim() || ""}
							/>

							<label htmlFor="accPassword">Mật khẩu mới</label>
							<div className="password-container">
								<input
									id="accPassword"
									type={showPwd ? "text" : "password"}
									placeholder="Nhập mật khẩu mới"
									value={formData.accPassword.trim() || ""}
									onChange={handleChange}
								/>
								<i
									className={`fa ${showPwd ? "fa-eye-slash" : "fa-eye"}`}
									onClick={() => setShowPwd(!showPwd)}
									style={{ cursor: "pointer" }}
								></i>
							</div>

							<button type="submit">
								CẬP NHẬT
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

export default ProfilePage;