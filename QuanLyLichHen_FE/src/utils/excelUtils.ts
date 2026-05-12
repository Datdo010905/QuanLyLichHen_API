import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string) => {
    //Khởi tạo một Worksheet từ mảng JSON
    const worksheet = XLSX.utils.json_to_sheet(data);

    //Tạo một Workbook (file Excel) mới
    const workbook = XLSX.utils.book_new();

    //Nhét Worksheet vào Workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    //Xuất file ra trình duyệt
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};