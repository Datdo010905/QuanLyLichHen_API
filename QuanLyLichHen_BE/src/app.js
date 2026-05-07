const express = require('express');
const cors = require('cors');
const dichVuRoutes = require('./routes/dichVuRoutes');
const loginRoutes = require('./routes/loginRoutes');
const taiKhoanRoutes = require('./routes/taiKhoanRoutes');
const khachHangRoutes = require('./routes/khachHangRoutes');
const nhanVienRoutes = require('./routes/nhanVienRoutes');
const khuyenMaiRoutes = require('./routes/khuyenMaiRoutes');
const lichHenRoutes = require('./routes/lichHenRoutes');
const hoaDonRoutes = require('./routes/hoaDonRoutes');
const thongKeRoutes = require('./routes/thongKeRoutes');
const app = express();

// Middleware
app.use(cors()); //không bị lỗi domain
app.use(express.json()); 

//CẤU HÌNH STATIC FILE CHO ẢNH
app.use('/img/product', express.static('uploads'));

// kết nối Route vào App
app.use('/api/dichvu', dichVuRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/taikhoan', taiKhoanRoutes);
app.use('/api/khachhang', khachHangRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/khuyenmai', khuyenMaiRoutes);
app.use('/api/lichhen', lichHenRoutes);
app.use('/api/hoadon', hoaDonRoutes);
app.use('/api/baocao', thongKeRoutes);
// Xử lý lỗi 404 cho các route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "Route không tồn tại!" });
});

module.exports = app;