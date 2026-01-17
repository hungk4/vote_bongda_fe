import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PLAYERS, BANK_INFO } from './config';

// Link ảnh CR7
const CR7_BANNER = "https://cdn.images.express.co.uk/img/dynamic/67/590x/secondary/Man-Utd-news-Cristiano-Ronaldo-SIU-celebration-Brighton-goal-3918291.jpg?r=1645034779588";

function UserPage() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    try {
        const res = await axios.get(API_PLAYERS);
        setPlayers(res.data);
    } catch (e) { console.error("Lỗi server"); }
  };

  const handleVote = async () => {
    if (!name.trim()) return;
    await axios.post(API_PLAYERS, { name });
    setName('');
    fetchPlayers();
  };

  const generateQR = () => {
    const content = `Da bong`; 
    const { BANK_ID, ACCOUNT_NO, TEMPLATE, AMOUNT } = BANK_INFO;
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${encodeURIComponent(content)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: 'white', minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Banner */}
        <div style={{ height: '220px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <img 
                src={CR7_BANNER} alt="CR7" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} 
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px' }}>
                <h1 style={{ margin: 0, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>⚽ Kèo đá bóng</h1>
            </div>
        </div>
        
        <div style={{ padding: '20px', flex: 1 }}>
            
            {/* Form Input */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <input 
                    value={name} onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleVote()}
                    placeholder="Nhập tên chiến thần..." 
                    style={{ padding: '12px 15px', flex: '1 1 200px', borderRadius: '8px', border: '2px solid #eee', fontSize: '16px', outline: 'none', transition: 'border 0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = '#28a745'} 
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                />
                <button 
                    onClick={handleVote} 
                    style={{ padding: '12px 20px', flex: '1 1 auto', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                    THAM GIA
                </button>
            </div>

            {/* --- DANH SÁCH (Đã sửa: Căn giữa + Tô đậm) --- */}
            <div style={{ 
                marginBottom: '15px', 
                display: 'flex', 
                justifyContent: 'center', // Căn giữa nội dung
                alignItems: 'center', 
                gap: '10px' // Khoảng cách giữa chữ và số
            }}>
                <h3 style={{ 
                    margin: 0, 
                    color: '#333', 
                    fontWeight: '900', // Tô rất đậm
                    fontSize: '18px',
                    textTransform: 'uppercase' // Viết hoa cho đẹp
                }}>
                    Danh sách siêu sao
                </h3>
                <span style={{ 
                    background: '#eee', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: '#555' 
                }}>
                    {players.length}
                </span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '50vh', overflowY: 'auto' }}>
                {players.map((p, index) => (
                <li key={p._id} style={{ 
                    padding: '15px', marginBottom: '10px', borderRadius: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f8f9fa', borderLeft: p.hasPaid ? '5px solid #28a745' : '5px solid #ffc107',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <strong style={{ marginRight: '12px', color: '#aaa', fontSize: '14px', width: '20px' }}>#{index + 1}</strong>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{p.name}</span>
                    </div>
                    <span style={{ 
                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: p.hasPaid ? '#d4edda' : '#fff3cd',
                        color: p.hasPaid ? '#155724' : '#856404',
                        whiteSpace: 'nowrap'
                    }}>
                        {p.hasPaid ? '✅ Đã ting ting' : '⏳ Chờ ting ting'}
                    </span>
                </li>
                ))}
            </ul>

            {/* QR Code */}
            <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '2px dashed #eee', paddingTop: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>💳 Nộp quỹ <span style={{color: '#28a745'}}>({BANK_INFO.AMOUNT.toLocaleString()}đ)</span></h3>
                <div style={{ padding: '10px', background: 'white', display: 'inline-block', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <img src={generateQR()} alt="QR Code" style={{ width: '100%', maxWidth: '200px', display: 'block' }} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;