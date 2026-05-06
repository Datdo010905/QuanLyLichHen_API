const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanVienController');

router.get('/get-all-nhanvien', nhanVienController.getAll);
router.get('/get-byId-nhanvien/:id', nhanVienController.getByID);
router.post('/insert-nhanvien', nhanVienController.create);
router.put('/update-nhanvien/:id', nhanVienController.update);
router.delete('/delete-nhanvien/:id', nhanVienController.remove);

router.post('/insert-full', nhanVienController.createWithAccount);
router.delete('/delete-full/:id', nhanVienController.deleteFullStaffTransaction);
module.exports = router;