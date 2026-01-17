import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PLAYERS, BANK_INFO } from './config';

const CR7_BANNER = "https://cdn.images.express.co.uk/img/dynamic/67/590x/secondary/Man-Utd-news-Cristiano-Ronaldo-SIU-celebration-Brighton-goal-3918291.jpg?r=1645034779588";

function UserPage() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    try {
        const res = await axios.get(API_PLAYERS);
        setPlayers(res.data);
    } catch (e) { console.error("Lỗi server"); }
  };

  const handleVote = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
        await axios.post(API_PLAYERS, { name });
        setName('');
        await fetchPlayers();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const generateQR = () => {
    const content = `Da bong`; 
    const { BANK_ID, ACCOUNT_NO, TEMPLATE, AMOUNT } = BANK_INFO;
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${encodeURIComponent(content)}`;
  };

  // Logic thống kê
  const totalPaid = players.filter(p => p.hasPaid).length;
  const hasTeams = players.some(p => p.team); 
  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  // Component Thẻ Cầu Thủ (Sử dụng Tailwind)
  const PlayerCard = ({ p, index, isMini = false }) => (
    <div className={`flex justify-between items-center bg-white rounded-xl shadow-sm border-l-4 mb-2 transition-transform hover:-translate-y-1 hover:shadow-md ${isMini ? 'p-2' : 'p-3'}`}
         style={{ borderColor: p.hasPaid ? '#22c55e' : '#eab308' }}>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
            {!isMini && (
                <div className="w-6 h-6 flex-shrink-0 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                </div>
            )}
            <span className={`${isMini ? 'text-sm' : 'text-base'} font-bold text-gray-700 truncate`}>
                {p.name}
            </span>
        </div>

        {!isMini && (
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex-shrink-0 border ${
                p.hasPaid 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
                {p.hasPaid ? '✅ ĐÃ TING TING' : '⏳ CHỜ TING TING'}
            </span>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-[500px] bg-white min-h-screen shadow-lg flex flex-col">
        
        {/* Banner */}
        <div className="h-56 relative overflow-hidden flex-shrink-0">
            <img src={CR7_BANNER} alt="CR7" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
                <h1 className="m-0 text-white uppercase tracking-wider text-2xl font-extrabold drop-shadow-md">⚽ Kèo Bóng Đá</h1>
                <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] bg-white/20 px-2 py-1 rounded text-white backdrop-blur-sm">🏟️ Sân 7</span>
                    <span className="text-[11px] bg-green-600/90 px-2 py-1 rounded text-white font-bold">
                        💰 Quỹ: {totalPaid}/{players.length} ting ting
                    </span>
                </div>
            </div>
        </div>
        
        <div className="p-4 flex-1 bg-gray-50">
            {/* Form Nhập Tên */}
            <div className="flex gap-2 mb-6 flex-wrap bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <input 
                    value={name} onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleVote()}
                    placeholder="Nhập tên chiến thần..." 
                    className="p-3 flex-[1_1_180px] rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500 focus:bg-white bg-gray-50 transition-colors"
                />
                <button onClick={handleVote} disabled={loading} 
                    className="px-5 py-3 flex-[1_1_auto] bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg font-bold text-sm whitespace-nowrap shadow-green-200 shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                    {loading ? '...' : 'THAM GIA'}
                </button>
            </div>

            {/* PHẦN 1: KẾT QUẢ CHIA ĐỘI */}
            {hasTeams && (
                <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex justify-center items-center mb-3">
                        <h3 className="text-gray-800 text-base font-extrabold uppercase border-b-2 border-blue-500 pb-1">🔥 Đội hình thi đấu</h3>
                    </div>
                    <div className="flex gap-3 items-start">
                        {/* Team A */}
                        <div className="flex-1 bg-rose-50 p-2 rounded-xl border border-rose-100">
                            <h4 className="text-rose-700 text-center text-xs font-black mb-2 uppercase">🔴 TEAM A ({teamA.length})</h4>
                            <div>{teamA.map((p, i) => <PlayerCard key={p._id} p={p} index={i} isMini={true} />)}</div>
                        </div>
                        {/* Team B */}
                        <div className="flex-1 bg-blue-50 p-2 rounded-xl border border-blue-100">
                            <h4 className="text-blue-700 text-center text-xs font-black mb-2 uppercase">🔵 TEAM B ({teamB.length})</h4>
                            <div>{teamB.map((p, i) => <PlayerCard key={p._id} p={p} index={i} isMini={true} />)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* PHẦN 2: DANH SÁCH ĐĂNG KÝ */}
            <div className={hasTeams ? "mt-5" : ""}>
                <div className="flex justify-center items-center gap-2 mb-4">
                    <h3 className="text-gray-800 font-black text-lg uppercase">Danh sách các siêu sao</h3>
                    <span className="bg-gray-200 px-2 py-1 rounded-full text-xs font-bold text-gray-600">{players.length}</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    {players.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 italic text-sm">Chưa có ai đăng ký.<br/>Mở bát đi bạn ơi! 🚀</div>
                    ) : (
                        players.map((p, index) => <PlayerCard key={p._id} p={p} index={index} />)
                    )}
                </div>
            </div>

            {/* QR Code */}
            <div className="mt-8 text-center border-t-2 border-dashed border-gray-200 pt-6 pb-6">
                <div className="bg-white p-4 rounded-2xl inline-block shadow-sm max-w-full">
                    <p className="mb-2 font-bold text-gray-700 text-xs uppercase">
                        Quét mã ting ting <span className="text-green-600">({BANK_INFO.AMOUNT.toLocaleString()}đ)</span>
                    </p>
                    <img src={generateQR()} alt="QR Code" className="w-full max-w-[160px] h-auto block rounded-lg mx-auto" />
                    <p className="mt-2 text-[10px] text-gray-400">Nội dung: <b>Da bong</b></p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
export default UserPage;