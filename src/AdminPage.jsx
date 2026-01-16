// client/src/AdminPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PLAYERS, API_LOGIN } from './config';

// Ảnh CR7
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

  // --- GIAO DIỆN LOGIN (Đã trang trí) ---
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="app-container" style={{ width: '100%', maxWidth: '450px', padding: '40px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ marginBottom: '20px' }}>
                <img src={CR7_LOGIN_IMG} alt="Admin" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-green)' }} />
            </div>
            <h2 style={{margin: '0 0 10px 0', fontWeight: 800}}>HUẤN LUYỆN VIÊN</h2>
            <p style={{marginBottom: '30px', color: '#666'}}>Khu vực chỉ dành cho ban quản lý đội bóng.</p>
            
            <input 
                type="password" placeholder="Mật khẩu chiến thuật..." 
                value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '2px solid #eee', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
            />
            
            <button 
                onClick={handleLogin} disabled={loading}
                style={{ width: '100%', padding: '12px', background: 'var(--dark-text)', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
            >
                {loading ? 'Đang kiểm tra VAR...' : 'MỞ KHÓA'}
            </button>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN QUẢN LÝ (Đã trang trí) ---
  return (
    <div className="app-container" style={{ maxWidth: '800px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🛠</span>
            <h1 style={{margin: 0, fontSize: '22px'}}>Quản Lý Đội Hình</h1>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            Đăng xuất
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
            <tr>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Cầu thủ</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#666', fontWeight: 600 }}>Trạng thái quỹ</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {players.length === 0 ? (
                <tr><td colSpan="3" style={{padding: '30px', textAlign: 'center', color: '#999'}}>Chưa có cầu thủ nào đăng ký.</td></tr>
            ) : (
                players.map((p) => (
                    <tr key={p._id} style={{ background: '#f8f9fa', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <td style={{ padding: '15px', fontWeight: '700', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{p.name}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                        {p.hasPaid ? (
                            <span style={{ color: 'var(--primary-green)', background: '#d4edda', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Đã đóng</span>
                        ) : (
                            <span style={{ color: 'var(--danger-red)', background: '#f8d7da', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Chưa đóng</span>
                        )}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                        <button onClick={() => togglePay(p._id)} style={{ marginRight: '8px', cursor: 'pointer', padding: '6px 12px', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px' }}>
                            ✔ Tick
                        </button>
                        <button onClick={() => deletePlayer(p._id)} style={{ cursor: 'pointer', padding: '6px 12px', background: 'var(--danger-red)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px' }}>
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
  );
}

export default AdminPage;