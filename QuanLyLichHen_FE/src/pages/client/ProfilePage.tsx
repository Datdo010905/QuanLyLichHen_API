import "../../assets/css/lichsu.css";
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import CustomerApi from "../../api/customerApi";

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
		cusAcc: '',
		cusEmail: ''
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
					const email = customerData.EMAIL;
					setName(tenGoc);
					setFormDataKH((prev) => ({
						...prev,
						cusName: tenGoc,
						cusEmail: email
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
		setFormData((prev) => ({ ...prev, [id]: value }));
		setFormDataKH((prev) => ({ ...prev, [id]: value }));
	};

	//đổi tên
	const submitDataKH = {
		HOTEN: formDataKH.cusName.trim(),
		SDT: user.trim(),
		MATK: user.trim(),
		EMAIL: formDataKH.cusEmail.trim(),
	};

	//đổi mật khẩu
	const submitDataTK = {
		MATK: user.trim(),
		PASS: formData.accPassword.trim(),
		PHANQUYEN: Number(formData.accRole),
		TRANGTHAI: formData.accStatus.trim()
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const finalName = formDataKH.cusName.trim();
		if (!finalName) {
			toast.warn("Họ tên không được để trống!");
			return;
		}
		try {
			const payload = {
				customerData: submitDataKH,
				accountData: submitDataTK
			};
			const response = await CustomerApi.updateProfileFull(user.trim(), payload);

			if (response.data.success) {
				toast.success(response.data.message || "Thay đổi thông tin cá nhân thành công!");
				fetchData();
				// Cập nhật xong thì xóa rỗng ô mật khẩu
				setFormData(prev => ({ ...prev, accPassword: '' }));
			}

		} catch (error: any) {
			console.error("Lỗi cập nhật Profile:", error);
			// HỨNG LỖI TỪ BACKEND
			if (error.response && error.response.data && error.response.data.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error("Cập nhật thất bại, vui lòng kiểm tra lại!");
			}
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

							<label htmlFor="cusEmail">Email</label>
							<input
								id="cusEmail"
								type="email"
								placeholder="Email"
								value={formDataKH.cusEmail}
								onChange={handleChange}
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