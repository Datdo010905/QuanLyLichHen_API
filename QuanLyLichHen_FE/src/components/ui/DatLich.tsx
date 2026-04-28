import React, { useEffect, useState } from "react";
import CustomerApi from "../../api/customerApi";
import {useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const Datlich = () => {
  const [sdt, setSDT] = useState("");
  const navigate = useNavigate();


  const LuuSDT = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang

    //chưa đăng nhập thì nhảy sang login

    const isLoggedIn = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!isLoggedIn || !token) {
      toast.warn("Vui lòng đăng nhập để tiếp tục đặt lịch!");
      navigate('/login');
      return;
    }

    //nếu đã đăng nhập thì lấy sdt lắp vào ô input để sang trang đặt lịch
    const savedSDT = localStorage.getItem("username") || sdt;

    if (savedSDT) {
      localStorage.setItem("username", savedSDT);
      //lấy tên KH
      try {
        const resKH = await CustomerApi.getById(savedSDT);
        localStorage.setItem("tenkhach", resKH.data.data.HOTEN);
        navigate('/datlich');
      } 
      catch {
        toast.error("Vui lòng nhập số điện thoại để đặt lịch!");
      }
    }


  }

  useEffect(() => {
    const savedSDT = localStorage.getItem("username");
    if (savedSDT) {
      setSDT(savedSDT); // Tự động điền vào ô input khi vào trang
    }
  }, []);
  return (
    <div className="datlich-container">
      <div className="datlich">
        <h2>ĐẶT LỊCH GIỮ CHỖ CHỈ 30 GIÂY</h2>
        <p>Cắt xong trả tiền, huỷ lịch không sao</p>
        <div className="form-row">
          <input readOnly
            id="input-sdt"
            maxLength={10}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9]/g, "");
            }}
            type="text"
            placeholder="0xxx.xxx.xxx"
            value={sdt}
            onChange={(e) => setSDT(e.target.value)}//cập nhật state
          />

          <button id="btn-datlich" onClick={LuuSDT}>
            ĐẶT LỊCH NGAY
          </button>


        </div>

      </div>
      <div className="danhgia">
        <h3>MỜI BẠN ĐÁNH GIÁ CHẤT LƯỢNG PHỤC VỤ</h3>
        <p>Phản hồi của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn</p>

        <div className="stars">
          ★★★★☆
        </div>
      </div>
    </div>
  );
};

export default Datlich;