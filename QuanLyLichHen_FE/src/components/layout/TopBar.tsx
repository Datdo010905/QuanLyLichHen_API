import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'; // Lấy hook ra để sử dụng trong component
import {toast} from 'react-toastify';
const TopBar = () => {

	const navigate = useNavigate();
	const { user, logout } = useAuth(); // Lấy biến user và hàm logout từ context

	const handleLogout = () => {
		const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
		
		if (isConfirm) {
			logout(); // Xóa sạch dữ liệu trong vùng nhớ chung
			toast.success("Đăng xuất thành công!");
			navigate('/login', { replace: true });
			
		}
	}

	return (
		<div id="header1">
			<div id="top1">
				<div id="h_left">
					<div id="left_1">
						<div id="pic"><i className="fa-solid fa-envelope"></i></div>
						<div id="hello"><a target="_blank"
							href="https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSHwfRSrvNjtqMMNwprHMlCDLShrrDCsqNGQzMdHSqmFnvHDQHKGxxPkLqCKrJzpxZkqlSNt">dotiendat092005@gmail.com</a>
						</div>
					</div>
					<div id="left_2">+03 52.512.556 Hỗ trợ 24/7 </div>
				</div>
				<div id="h_right">
					<div id="r1">
						<div id="social">
							<div id="icon_social">

								<div><a target="_blank" href="https://www.facebook.com/toladatdo"><i
									className="fa-brands fa-facebook"></i></a></div>
								<div><a target="_blank" href="https://www.instagram.com/_arisu.09/"><i
									className="fa-brands fa-twitter"></i></a></div>
								<div><a target="_blank" href="https://www.instagram.com/_arisu.09/"><i
									className="fa-brands fa-instagram"></i></a></div>
								<div><a target="_blank" href="https://www.pinterest.com/"><i
									className="fa-brands fa-pinterest"></i></a></div>
							</div>
						</div>
					</div>
					<div id="r2">
						<div id="language">
							<div id="icon_l">
								<div><img className="picture_l" src="/img/language.jpg" alt="Language" /></div>
								<div id="a_lang">Vietnamese</div>
							</div>
						</div>
					</div>
					<div id="r3">
						<div id="login">
							<div id="a_log">
								<i className="fa-solid fa-user"></i>
								{/* KIỂM TRA ĐIỀU KIỆN HIỂN THỊ */}
								{user ? (
									<>
										<Link to="/profile"><span> {user.username} </span></Link>
										<button className = "logout-btn"onClick={handleLogout}><i className="fas fa-right-from-bracket"></i></button>
									</>
								) : (
									<Link id="login-hello" to="/login" replace> Login</Link>
								)}

							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	);
}

export default TopBar;
