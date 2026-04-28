const khachHangService = require('../services/khachHangService');

const getAll = async (req, res) => {
    try {
        const data = await khachHangService.getAllKhachHang();
        return res.status(200).json({ success: true, message: "Lấy danh sách thành công!", data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getByID = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await khachHangService.getKhachHangByID(id);
        if (data) {
            return res.status(200).json({ success: true, message: "Tìm thấy khách hàng!", data: data });
        } else {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const data = req.body;
        const maNhanDuoc = data.MAKH || data.makh;
        
        // Check mã khách hàng
        const isExist = await khachHangService.getKhachHangByID(maNhanDuoc);
        if (isExist) return res.status(400).json({ success: false, message: "Mã hoặc SĐT đã tồn tại!" });

        const newData = await khachHangService.createKhachHang(data);
        return res.status(201).json({ success: true, message: "Thêm thành công!", data: newData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const sdt = data.SDT || data.sdt;

        const updatedData = await khachHangService.updateKhachHang(id, data);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        await khachHangService.deleteKhachHang(id);
        return res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ success: false, message: "Khách hàng này đã có lịch hẹn, không thể xóa!" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAll, getByID, create, update, remove };