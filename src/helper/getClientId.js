// Hàm tạo ID ngẫu nhiên cho máy nếu chưa có
export const getClientId = () => {
  let id = localStorage.getItem('bongda_client_id');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem('bongda_client_id', id);
  }
  return id;
};