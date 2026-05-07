const nodemailer = require('nodemailer');


// CẤU HÌNH NGƯỜI GỬI EMAIL (SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dotiendat01092005@gmail.com',
        pass: 'gyku wkzp xhep xzgt'  //mã app auth
    }
});


const forgotPasswordEmail = async (customerEmail, newPassword, customerName) => {
    const mailOptions = {
        from: '"Hệ thống 30Shine (dotiendat01092005@gmail.com)" <dotiendat01092005@gmail.com>',
        to: customerEmail,
        subject: 'Cấp lại mật khẩu tài khoản Salon',
        html: `
            <div style="padding: 2rem 1rem; background-color: #f8fafc;">
  <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 12px; border: 0.5px solid #e2e8f0; overflow: hidden; font-family: Arial, sans-serif;">

    <!-- Body -->
    <div style="padding: 32px;">

        <div>
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">Xin chào, <span style="color: #2563eb;">${customerName}</span></p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Yêu cầu đặt lại mật khẩu</p>
        </div>

      <p style="margin: 0 0 8px; font-size: 14px; color: #475569; line-height: 1.7;">
        Chúng tôi đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản của bạn. Đây là mật khẩu tạm thời:
      </p>

      <!-- Password Box -->
      <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border: 0.5px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Mật khẩu tạm thời</p>
          <p style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 3px; color: #1e293b; font-family: monospace;">${newPassword}</p>
        </div>
      </div>

      <!-- Warning -->
      <div style="padding: 14px 16px; background: #fffbeb; border-radius: 8px; border-left: 3px solid #f59e0b; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.6;">
          ⚠️ Vì lý do bảo mật, vui lòng đổi mật khẩu ngay sau khi đăng nhập.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
          📧 Mọi thắc mắc vui lòng liên hệ: <a href="mailto:dotiendat01092005@gmail.com" style="color: #2563eb; text-decoration: none;">dotiendat01092005@gmail.com</a>
        </p>

      <div style="border-top: 0.5px solid #e2e8f0; padding-top: 20px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 16px;"></div>
        <div>
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e293b;">Đội ngũ 30Shine</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Trân trọng</p>
        </div>
      </div>

  </div>
</div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Đã gửi mail thành công cho:", customerEmail);
        return true;
    } catch (error) {
        console.error("Lỗi gửi mail:", error);
        return false;
    }
};



const sendBookingPendingEmail = async (customerEmail, bookingInfo) => {
    // Cắt lấy Ngày/Tháng/Năm (DD/MM/YYYY)
    const ngay = new Date(bookingInfo.NGAYHEN);
    const ngayFormat = `${ngay.getUTCDate().toString().padStart(2, '0')}/${(ngay.getUTCMonth() + 1).toString().padStart(2, '0')}/${ngay.getUTCFullYear()}`;

    // Ép lấy Giờ:Phút gốc
    const gio = new Date(bookingInfo.GIOHEN);
    const gioFormat = `${gio.getUTCHours().toString().padStart(2, '0')}:${gio.getUTCMinutes().toString().padStart(2, '0')}`;

    const mailOptions = {
        from: '"Hệ thống 30Shine (dotiendat01092005@gmail.com)" <dotiendat01092005@gmail.com>',
        to: customerEmail,
        subject: 'Lịch hẹn của bạn đã được duyệt',
        html: `
    <div style="padding: 32px;">

        <div>
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">Xin chào, <span style="color: #d97706;">${bookingInfo.HOTEN}</span></p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Cảm ơn bạn đã đặt lịch tại Salon của chúng tôi</p>
        </div>
      

      <p style="margin: 0 0 16px; font-size: 13px; color: #475569; line-height: 1.7;">
        Chúng tôi đã ghi nhận lịch hẹn của bạn và sẽ sớm liên hệ để xác nhận.
      </p>

      <div style="background: #f8fafc; border-radius: 8px; border: 0.5px solid #e2e8f0; overflow: hidden; margin-bottom: 20px;">
        <div style="padding: 12px 16px; border-bottom: 0.5px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Thông tin lịch hẹn</p>
        </div>
        <div style="padding: 0 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 0.5px solid #e2e8f0;">
            <span style="font-size: 13px; color: #64748b;"> # Mã lịch: </span>
            <span style="font-size: 13px; font-weight: 600; color: #1e293b; font-family: monospace;"> ${bookingInfo.MALICH} </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 0.5px solid #e2e8f0;">
            <span style="font-size: 13px; color: #64748b;"> 📆 Ngày hẹn: </span>
            <span style="font-size: 13px; font-weight: 600; color: #1e293b;"> ${ngayFormat} </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 0.5px solid #e2e8f0;">
            <span style="font-size: 13px; color: #64748b;"> 🕐 Giờ hẹn: </span>
            <span style="font-size: 13px; font-weight: 600; color: #1e293b;"> ${gioFormat} </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
            <span style="font-size: 13px; color: #64748b;"> 🔄 Trạng thái: </span>
            <span style="font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: #eff6ff; color: #1d4ed8;"> Đang chờ xác nhận </span>
          </div>
        </div>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
          📧 Mọi thắc mắc vui lòng liên hệ: <a href="mailto:dotiendat01092005@gmail.com" style="color: #2563eb; text-decoration: none;">dotiendat01092005@gmail.com</a>
        </p>

      <div style="border-top: 0.5px solid #e2e8f0; padding-top: 20px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 16px;"></div>
        <div>
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e293b;">Đội ngũ 30Shine</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Trân trọng</p>
        </div>
      </div>
    </div>
  </div>
</div>
`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Đã gửi mail thành công cho:", customerEmail);
        return true;
    } catch (error) {
        console.error("Lỗi gửi mail:", error);
        return false;
    }
};

module.exports = { sendBookingPendingEmail, forgotPasswordEmail };
