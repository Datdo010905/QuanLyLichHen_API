const hoaDonService = require('../services/hoaDonService');

// --- BẢNG HOÁ ĐƠN ---
const getAll = async (req, res) => {
    try {
        const data = await hoaDonService.getAllHoaDon();
        return res.status(200).json({ success: true, data: data });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getByID = async (req, res) => {
    try {
        const data = await hoaDonService.getHoaDonByID(req.params.id);
        if (data) return res.status(200).json({ success: true, data: data });
        return res.status(404).json({ success: false, message: "Không tìm thấy hoá đơn!" });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const create = async (req, res) => {
    try {
        const data = req.body;
        const exist = await hoaDonService.getHoaDonByID(data.MAHD || data.mahd);
        if (exist) return res.status(400).json({ success: false, message: "Mã hoá đơn đã tồn tại!" });

        const newData = await hoaDonService.createHoaDon(data);
        return res.status(201).json({ success: true, message: "Thêm thành công!", data: newData });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = await hoaDonService.updateHoaDon(id, req.body);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedData });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const remove = async (req, res) => {
    try {
        await hoaDonService.deleteHoaDon(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
const getAllTheoNgay = async (req, res) => {
    try {
        const { ngaybd, ngaykt } = req.query;
        if (!ngaybd || !ngaykt) return res.status(400).json({ success: false, message: "Thiếu ngày bắt đầu hoặc kết thúc!" });

        const data = await hoaDonService.getHoaDonTheoNgay(ngaybd, ngaykt);
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- BẢNG CHI TIẾT HOÁ ĐƠN ---
const getAllCT = async (req, res) => {
    try {
        const data = await hoaDonService.getAllCT();
        return res.status(200).json({ success: true, data: data });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getCTByID = async (req, res) => {
    try {
        const data = await hoaDonService.getCTByID(req.params.id);
        return res.status(200).json({ success: true, data: data });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const createCT = async (req, res) => {
    try {
        const newData = await hoaDonService.createCT(req.body);
        return res.status(201).json({ success: true, message: "Thêm chi tiết thành công!", data: newData });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const removeCT = async (req, res) => {
    try {
        await hoaDonService.deleteCT(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa chi tiết thành công!" });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};


const createFull = async (req, res) => {
    try {
        const { invoice, details } = req.body;

        const exist = await hoaDonService.getHoaDonByID(invoice.MAHD || invoice.mahd);
        if (exist) {
            return res.status(400).json({ success: false, message: "Mã hoá đơn đã tồn tại!" });
        }

        const newData = await hoaDonService.createHoaDonWithDetails(invoice, details);
        
        return res.status(201).json({ success: true, message: "Thanh toán và lập hóa đơn thành công!", data: newData });
    } catch (error) { 
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

const deleteFull = async (req, res) => {
    try {
        // Lấy id từ URL
        const id = req.params.id; 

        await hoaDonService.deleteHoaDonWithDetails(id);

        return res.status(200).json({ 
            success: true, 
            message: "Đã xóa thành công hóa đơn và chi tiết!" 
        });

    } catch (error) {
        console.error("Lỗi xóa Hóa đơn:", error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn này!" });
        }
        
        return res.status(500).json({ success: false, message: "Lỗi máy chủ, thao tác xóa bị hủy!" });
    }
};
module.exports = {
    getAll,
    getByID,
    create,
    update,
    remove,
    getAllTheoNgay,
    getAllCT,
    getCTByID,
    createCT,
    removeCT,
    createFull,
    deleteFull
};