// client/src/config.js

// 1. Đường dẫn gốc (Base)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
// const API_BASE = 'http://localhost:5000/api';

// 2. Các endpoint cụ thể
export const API_PLAYERS = `${API_BASE}/players`; // Dùng cho danh sách, vote, xóa
export const API_LOGIN   = `${API_BASE}/login`;   // Dùng để check pass
export const API_MATCH = `${API_BASE}/match`; // Dùng để lấy thông tin trận đấu

// 3. Thông tin ngân hàng
export const BANK_INFO = {
    BANK_ID: 'VPB',           
    ACCOUNT_NO: '0852865816', 
    AMOUNT: 20000,            
    TEMPLATE: 'compact'       
};