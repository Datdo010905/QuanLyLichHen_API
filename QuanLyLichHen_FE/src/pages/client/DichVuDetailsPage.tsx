import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dichVuApi, { DichVu } from "../../api/dichvuApi";
import { toast } from "react-toastify";
import CustomerApi, { Customer } from "../../api/customerApi";
const DichVuDetailsPage = () => {

	//Lấy mã dịch vụ từ URL có dạng /dichvuchitiet/:madv)
	const { madv } = useParams<{ madv: string }>();
	//tạo state để lưu thông tin dịch vụ
	const [dichVu, setDichVu] = useState<DichVu | null>(null);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();
	//lấy dịch vụ từ api
	useEffect(() => {
		const fetchChiTiet = async () => {
			if (!madv) return;
			try {
				const response = await dichVuApi.getById(madv);

				// Tìm dịch vụ khớp với madv trên URL
				const foundItem = response.data?.data;
				console.log("Dịch vụ tìm thấy:", foundItem);
				if (foundItem) {
					setDichVu(foundItem);
				}
			} catch (error) {
				toast.error("Lỗi khi lấy chi tiết dịch vụ:" + (error instanceof Error ? error.message : "Unknown error"));
			} finally {
				setLoading(false);
			}
		};

		fetchChiTiet();
	}, [madv]);
	// Hàm format giá
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
	};
	const themlichhen = async (e: React.FormEvent) => {
		e.preventDefault();

		const isLoggedIn = localStorage.getItem("username");
		const token = localStorage.getItem("token");

		if (madv) {
			if (!isLoggedIn || !token) {
				toast.warn("Vui lòng đăng nhập để tiếp tục đặt lịch!");
				navigate('/login');
				return;
			} else {
				//nếu đã đăng nhập
				const savedSDT = localStorage.getItem("username");

				if (savedSDT) {
					localStorage.setItem("username", savedSDT);
					//lấy tên KH
					try {
						const resKH = await CustomerApi.getById(savedSDT);
						localStorage.setItem("tenkhach", resKH.data.data.HOTEN);
						localStorage.setItem('madvCanXem', madv);
						navigate('/datlich');
					}
					catch {
						toast.error("Có lỗi xảy ra khi đặt lịch!");
					}
				}

			}
		}
	};

	// Hàm render quy trình hoặc mô tả dạng list
	const renderListItems = (text?: string) => {
		if (!text) return <li>Đang cập nhật...</li>;
		const items = text.split(/[,\n]/).filter(item => item.trim() !== "");
		return items.map((item, index) => <li key={index}>{item.trim()}</li>);
	};

	if (loading) {
		return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu...</div>;
	}

	if (!dichVu) {
		return <div style={{ textAlign: 'center', marginTop: '50px' }}>Không tìm thấy dịch vụ!</div>;
	}
	return (
		<>
			<div className="product" id="chitietdichvu">
				<div className="product-title-3" style={{ marginTop: '20px' }}>
					<Link to="/home">Dịch vụ</Link> - {dichVu.TENDV}
				</div>

				<div className="col-s-6 col-m-5 col-x-4">
					<div className="itemchitiet" style={{ border: 'none' }}>
						{/* Hiển thị ảnh chính từ DB */}
						<img id="slide_dv" className="pic_itemchitiet" title={dichVu.TENDV}
							src={`${dichVu.HINH}`} alt={dichVu.TENDV} />
					</div>
				</div>

				<div className="col-s-6 col-x-4 col-m-7">
					<div className="name_itemchitiet">
						{dichVu.TENDV}
					</div>
					<div className="react" style={{ color: "#ff9300" }}>
						{[...Array(5)].map((_, i) => (
							<svg key={i} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
								<path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
							</svg>
						))}
						<a href="https://www.facebook.com/toladatdo" style={{ marginLeft: '10px', color: '#00a2ff' }}>({dichVu.THOIGIAN} đánh giá của khách hàng)</a>
					</div>

					<div className="phut-gia">
						<div className="phut">{dichVu.THOIGIAN} phút</div>
						<div className="giachitiet"><span>{formatPrice(dichVu.GIADV)}</span></div>
					</div>

					<div className="btn-datlichchitiet">
						<button id="btn-datlich" onClick={themlichhen} style={{ marginTop: '10px', width: '100%' }}>ĐẶT LỊCH NGAY</button>
					</div>

					<div className="mota-dv">
						<div className="title_quytrinh">MÔ TẢ</div>
						<div className="quytrinh_content" style={{ marginLeft: '40px' }}>
							{/*đổ dữ liệu HTML */}
							{renderListItems(dichVu.MOTA)}
						</div>
					</div>
				</div>

				<div className="col-s-12 col-x-4 col-m-12">
					<div className="mota-dv">
						<div className="title_quytrinh">QUY TRÌNH DỊCH VỤ</div>
						<div className="quytrinh_content" style={{ marginLeft: '40px' }}>
							{renderListItems(dichVu.QUYTRINH)}
						</div>
					</div>
				</div>
			</div>
			<div className="clear"></div>
		</>
	);
};

export default DichVuDetailsPage;