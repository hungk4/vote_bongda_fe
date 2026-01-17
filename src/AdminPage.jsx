import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PLAYERS, API_LOGIN } from './config';

const CR7_LOGIN_IMG = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg";

function AdminPage() {
  const [players, setPlayers] = useState([]);
  const [adminPass, setAdminPass] = useState(localStorage.getItem('adminPass') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminPass) { verifyPassword(adminPass); }
  }, []);

  const verifyPassword = async (password) => {
    try {
        await axios.post(API_LOGIN, { adminPass: password });
        setIsLoggedIn(true); localStorage.setItem('adminPass', password); fetchPlayers(); 
    } catch (err) { setIsLoggedIn(false); }
  };

  const fetchPlayers = async () => {
    try {
        const res = await axios.get(API_PLAYERS);
        setPlayers(res.data);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async () => {
    if (!adminPass) return alert("Nhập mật khẩu vào đi sếp!");
    setLoading(true);
    try {
        await axios.post(API_LOGIN, { adminPass });
        setIsLoggedIn(true); localStorage.setItem('adminPass', adminPass); fetchPlayers(); 
    } catch (err) { alert("Sai mật khẩu!"); setIsLoggedIn(false);
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
      localStorage.removeItem('adminPass'); setIsLoggedIn(false); setAdminPass(''); setPlayers([]);
  };

  const togglePay = async (id) => {
    try { await axios.put(`${API_PLAYERS}/${id}/pay`, { adminPass }); fetchPlayers();
    } catch (err) { alert("Lỗi server hoặc sai pass!"); }
  };

  const deletePlayer = async (id) => {
      if(window.confirm("Xóa người này khỏi đội hình?")) {
        try { await axios.delete(`${API_PLAYERS}/${id}`, { data: { adminPass: adminPass } }); fetchPlayers();
        } catch (err) { alert("Lỗi khi xóa!"); }
      }
  };

  // --- GIAO DIỆN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', padding: '40px 30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <img src={CR7_LOGIN_IMG} alt="Admin" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #28a745', padding: '2px', marginRight: '20px' }} />
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{margin: '0 0 5px 0', fontWeight: 800, color: '#333', fontSize: '20px'}}>HUẤN LUYỆN VIÊN</h2>
                    <p style={{margin: 0, color: '#666', fontSize: '14px'}}>Khu vực chỉ dành cho ban quản lý.</p>
                </div>
            </div>
            
            <input 
                type="password" placeholder="Mật khẩu chiến thuật..." 
                value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                style={{ width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px', outline: 'none', transition: '0.3s' }}
                onFocus={(e) => e.target.style.borderColor = '#28a745'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            
            <button 
                onClick={handleLogin} disabled={loading}
                style={{ width: '100%', padding: '14px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' }}
                onMouseOver={(e) => !loading && (e.target.style.background = '#555')}
                onMouseOut={(e) => !loading && (e.target.style.background = '#333')}
            >
                {loading ? 'Đang kiểm tra...' : 'MỞ KHÓA'}
            </button>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN QUẢN LÝ ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', height: 'fit-content' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>🛠</span>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: '700' }}>Quản Lý Đội Hình</h1>
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f8f9fa', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Đăng xuất
            </button>
        </div>

        {/* Table Container: overflowX auto giúp cuộn ngang trên mobile */}
        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '15px 25px', textAlign: 'left', color: '#666', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Cầu thủ</th>
                        <th style={{ padding: '15px 10px', textAlign: 'center', color: '#666', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Trạng thái quỹ</th>
                        <th style={{ padding: '15px 25px', textAlign: 'right', color: '#666', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                {players.length === 0 ? (
                    <tr><td colSpan="3" style={{padding: '40px', textAlign: 'center', color: '#999', fontStyle: 'italic'}}>Chưa có cầu thủ nào đăng ký.</td></tr>
                ) : (
                    players.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                            {/* textAlign: left cho tên cầu thủ */}
                            <td style={{ padding: '15px 25px', fontWeight: '600', color: '#333', verticalAlign: 'middle', textAlign: 'left' }}>{p.name}</td>
                            <td style={{ padding: '15px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                {p.hasPaid ? (
                                    <span style={{ color: '#155724', background: '#d4edda', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Đã ting ting</span>
                                ) : (
                                    <span style={{ color: '#721c24', background: '#f8d7da', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Chưa ting ting</span>
                                )}
                            </td>
                            <td style={{ padding: '15px 25px', textAlign: 'right', verticalAlign: 'middle' }}>
                                <button onClick={() => togglePay(p._id)} style={{ marginRight: '8px', cursor: 'pointer', padding: '8px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 5px rgba(40, 167, 69, 0.2)' }}>
                                    ✔ Tick
                                </button>
                                <button onClick={() => deletePlayer(p._id)} style={{ cursor: 'pointer', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 5px rgba(220, 53, 69, 0.2)' }}>
                                    🗑 Xóa
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;