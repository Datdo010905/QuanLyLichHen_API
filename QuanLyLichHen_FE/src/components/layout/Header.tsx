import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import dichVuApi, { DichVu } from "../../api/dichvuApi";

const Header = () => {
  const navigate = useNavigate();

  // Các state để quản lý tìm kiếm
  const [keyword, setKeyword] = useState("");

  const [allServices, setAllServices] = useState<DichVu[]>([]);
  const [filteredServices, setFilteredServices] = useState<DichVu[]>([]);

  const [showDropdown, setShowDropdown] = useState(false);

  //xử lý click ra ngoài ô tìm kiếm
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      let services: DichVu[] = [];

      const dichVuStr = await dichVuApi.getAllClient();
      if (dichVuStr) {
        services = dichVuStr.data.data;
      }

      const skinCareStr = await dichVuApi.getAllCSDClient();
      if (skinCareStr) {
        const skinCare = skinCareStr.data.data;
        // Gộp cả Dịch vụ Tóc và Chăm sóc da
        services = services.concat(skinCare);
      }

      //lưu danh sách
      setAllServices(services);
    }
    //chạy
    loadServices();
  }, []);

  //sự kiện click ra ngoài để ẩn dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //gõ phím
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //ký tự nhập
    const value = e.target.value;
    setKeyword(value);

    const searchStr = value.toLowerCase().trim();
    //ko có
    if (searchStr.length === 0) {
      setShowDropdown(false);
      setFilteredServices([]);
      return;
    }

    // Lọc dịch vụ theo tên, thời gian, giá
    const results = allServices.filter(dv => {
      const parseKeyword = parseFloat(searchStr);
      return (
        dv.TENDV.toLowerCase().includes(searchStr) ||
        dv.THOIGIAN.toString().includes(searchStr) ||
        (!isNaN(parseKeyword) && dv.GIADV <= parseKeyword)
      );
    });

    //lưu kết quả tìm
    setFilteredServices(results);
    setShowDropdown(results.length > 0);
  };

  //click vào dịch vụ
  const handleSelectService = (dv: DichVu) => {
    setKeyword(dv.TENDV);       // Điền tên vào ô input
    setShowDropdown(false);     // Ẩn dropdown
    localStorage.setItem("madvCanXem", dv.MADV);

    //chuyển
    navigate(`/dichvuchitiet/${dv.MADV}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div id="header">
      <div id="top">
        <div id="top-content">
          <div id="top-left">
            <Link to="/"><img src="/img/logoTo.png" alt="Logo" /></Link>
          </div>
          <div id="top-mid">
            {/* Thêm ref vào div bọc ngoài cùng của khu vực tìm kiếm */}
            <div style={{ position: "relative" }} ref={searchRef}>
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  id="indexSearch"
                  placeholder="Tìm kiếm tên dịch vụ"
                  value={keyword}
                  onChange={handleSearchChange}
                  onFocus={() => { if (filteredServices.length > 0) setShowDropdown(true) }}
                />
                <button type="button">
                  <img src="/img/find.jpg" alt="Tìm kiếm" />
                </button>
              </form>

              {/* Chỉ render thẻ ul nếu showDropdown là true */}
              {showDropdown && (
                <ul id="searchResults" className="search-dropdown" style={{ display: 'block', marginLeft: '55px' }}>
                  {filteredServices.map((dv, index) => (
                    <li key={index} onClick={() => handleSelectService(dv)} style={{ cursor: "pointer" }}>
                      <img src={dv.HINH ? `${dv.HINH}` : '/img/logo.png'} alt="img" />
                      <div>
                        <b>{dv.TENDV}</b><br />
                        <i style={{ lineHeight: "22px", marginRight: "20px" }}>{formatCurrency(dv.GIADV)}</i>
                        <span style={{ color: "#0a2a78" }}>{dv.THOIGIAN} phút</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>
          <div id="top-right">
            <div id="top-right-content">
              <div id="t2">
                <Link to="/lichsu">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                    viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;