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
    if (!name) return;
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
    <div className="app-container">
      {/* Banner CR7 */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img 
            src={CR7_BANNER} alt="CR7" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} 
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '20px' }}>
            <h1 style={{ margin: 0, color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>⚽ Kèo đá bóng</h1>
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        {/* Form Input */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input 
            value={name} onChange={(e) => setName(e.target.value)} 
            placeholder="Nhập tên chiến thần..." 
            style={{ padding: '12px 15px', flex: 1, borderRadius: '8px', border: '2px solid #eee', fontSize: '16px', outline: 'none', transition: 'border 0.3s' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
            />
            <button onClick={handleVote} style={{ padding: '12px 24px', background: 'var(--primary-green)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
            THAM GIA!
            </button>
        </div>

        {/* Danh sách */}
        <h3 style={{marginBottom: '15px'}}>Danh sách các siêu sao ({players.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
            {players.map((p, index) => (
            <li key={p._id} style={{ 
                padding: '12px 15px', marginBottom: '8px', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#f8f9fa', borderLeft: p.hasPaid ? '4px solid var(--primary-green)' : '4px solid orange'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <strong style={{ marginRight: '10px', color: '#888' }}>#{index + 1}</strong>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>{p.name}</span>
                </div>
                <span style={{ 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: p.hasPaid ? '#d4edda' : '#fff3cd',
                    color: p.hasPaid ? 'var(--primary-green)' : '#856404'
                }}>
                    {p.hasPaid ? '✅ Đã ting ting' : '⏳ Chờ ting ting'}
                </span>
            </li>
            ))}
        </ul>

        {/* QR Code */}
        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '2px dashed #eee', paddingTop: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>💳 Nộp quỹ ({BANK_INFO.AMOUNT.toLocaleString()}đ)</h3>
            <div style={{ padding: '10px', background: 'white', display: 'inline-block', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <img src={generateQR()} alt="QR Code" style={{ width: '100%', maxWidth: '280px', display: 'block' }} />
            </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;