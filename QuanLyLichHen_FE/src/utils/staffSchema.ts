
import { z } from 'zod';

export const staffSchema = z.object({
    staffID: z.string().min(1, { message: "Mã nhân viên không được để trống" }),
    staffName: z.string().min(1, { message: "Tên nhân viên không được để trống" }),
    staffPosition: z.string().min(1, { message: "Chức vụ không được để trống" }),
    staffPhone: z.string().min(1, { message: "Số điện thoại không được để trống" }),
    staffAddress: z.string().min(1, { message: "Địa chỉ không được để trống" }),
    staffBranch: z.string().min(1, { message: "Chi nhánh không được để trống" }),
    staffBirthDate: z.string().min(1, { message: "Ngày sinh không được để trống" }),

}).refine((date) => {
    const birthDate = new Date(date.staffBirthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 65;
}, { message: "Ngày sinh phải thuộc khoảng từ 18 đến 65 tuổi", path: ["staffBirthDate"] });


export type StaffFormValues = z.infer<typeof staffSchema>;