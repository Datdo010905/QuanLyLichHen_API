const express = require('express');
const router = express.Router();
const lichHenController = require('../controllers/lichHenController');

// Route lich hẹn
router.get('/get-all-lichhen', lichHenController.getAll);
router.get('/get-byId-lichhen/:id', lichHenController.getByID);
router.get('/get-byIdKH-lichhen/:id', lichHenController.getByIDKH);
router.post('/insert-lichhen', lichHenController.create);
router.put('/update-lichhen/:id', lichHenController.updateStatus);
router.delete('/delete-lichhen/:id', lichHenController.remove);
router.get('/get-all-lichhenTheoNgay', lichHenController.getAllTheoNgay);
// Route chi tiết lịch hẹn
router.get('/get-all-CTlichhen', lichHenController.getAllCT);
router.get('/get-byId-CTlichhen/:id', lichHenController.getCTByID);
router.post('/insert-CTlichhen', lichHenController.createCT);
router.put('/update-CTlichhen/:id', lichHenController.updateCT);
router.delete('/delete-CTlichhen/:id', lichHenController.removeCT);


router.post('/create-full', lichHenController.createBookingTransaction);
router.delete('/delete-full/:id', lichHenController.deleteFullBookingTransaction);
module.exports = router;