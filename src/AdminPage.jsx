import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PLAYERS, API_LOGIN, API_MATCH } from './config';

const CR7_LOGIN_IMG = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg";

// --- Toast Component ---
const Toast = ({ toast }) => {
    if (!toast) return null;
    const isSuccess = toast.type === 'success';
    return (
        <div className={`fixed top-5 right-5 z-50 bg-white border-l-4 text-gray-800 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-[85vw] animate-[slideIn_0.3s_ease] transition-all ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
            <span className="text-xl">{isSuccess ? '✅' : '⚠️'}</span>
            <span className="font-semibold text-sm">{toast.message}</span>
        </div>
    );
};

function AdminPage() {
  const [players, setPlayers] = useState([]);
  const [adminPass, setAdminPass] = useState(localStorage.getItem('adminPass') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // --- State mới cho thông tin trận đấu ---
  const [matchInfo, setMatchInfo] = useState({ location: '', time: '' });

  useEffect(() => { if (adminPass) verifyPassword(adminPass); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const verifyPassword = async (password) => {
    try {
        await axios.post(API_LOGIN, { adminPass: password });
        setIsLoggedIn(true); 
        localStorage.setItem('adminPass', password); 
        fetchPlayers(); 
        fetchMatchInfo(); // <--- Gọi thêm hàm này
    } catch (err) { setIsLoggedIn(false); }
  };

  const fetchPlayers = async () => {
    try {
        const res = await axios.get(API_PLAYERS);
        setPlayers(res.data);
    } catch (e) { console.error(e); }
  };

  // -- Lấy thông tin trận đấu ---
  const fetchMatchInfo = async () => {
    try {
      const res = await axios.get(API_MATCH);
      if (res.data) {
        let formattedTime = '';
        if (res.data.time) {
            // Xử lý hiển thị giờ địa phương cho input datetime-local
            const date = new Date(res.data.time);
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
            formattedTime = localISOTime;
        }
        setMatchInfo({ 
            location: res.data.location || '', 
            time: formattedTime 
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin trận:", error);
    }
  };

  // --- Hàm mới: Lưu thông tin trận đấu ---
  const handleSaveMatchInfo = async () => {
    try {
      await axios.post(API_MATCH, {
        location: matchInfo.location,
        time: matchInfo.time
      });
      showToast('Cập nhật thông tin trận đấu thành công!', 'success');
    } catch (error) {
      showToast('Lỗi khi lưu thông tin trận đấu', 'error');
    }
  };

  const handleLogin = async () => {
    if (!adminPass) return alert("Nhập mật khẩu vào đi sếp!");
    setLoading(true);
    try {
        await axios.post(API_LOGIN, { adminPass });
        setIsLoggedIn(true); 
        localStorage.setItem('adminPass', adminPass); 
        fetchPlayers();
        fetchMatchInfo(); // <--- Gọi thêm hàm này
    } catch (err) { alert("Sai mật khẩu!"); setIsLoggedIn(false); } 
    finally { setLoading(false); }
  };

  const handleLogout = () => {
      localStorage.removeItem('adminPass'); setIsLoggedIn(false); setAdminPass(''); setPlayers([]);
  };

  const togglePay = async (id) => {
    try { 
        const player = players.find(p => p._id === id);
        await axios.put(`${API_PLAYERS}/${id}/pay`, { adminPass }); 
        fetchPlayers();
        const statusText = !player.hasPaid ? "Đã đóng tiền" : "Hoàn tác (Chưa đóng)";
        showToast(`Đã cập nhật: ${player.name} -> ${statusText}`, 'success');
    } catch (err) { showToast("Lỗi server!", 'error'); }
  };

  const deletePlayer = async (id) => {
      if(window.confirm("Xóa người này?")) {
        try { 
            await axios.delete(`${API_PLAYERS}/${id}`, { data: { adminPass: adminPass } }); 
            fetchPlayers();
            showToast("Đã xóa!", 'error'); 
        } catch (err) { showToast("Lỗi xóa!", 'error'); }
      }
  };

  const handleRandomSplit = async () => {
      if (players.length < 2) return showToast("Ít người quá chia làm sao?", 'error');
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      const mid = Math.ceil(shuffled.length / 2);
      const teamA_Ids = shuffled.slice(0, mid).map(p => p._id);
      const teamB_Ids = shuffled.slice(mid).map(p => p._id);
      updateTeams(teamA_Ids, teamB_Ids, "Đã chia ngẫu nhiên thành công!");
  };

  const handleChangeTeam = (playerId, newTeam) => {
      const updatedPlayers = players.map(p => p._id === playerId ? { ...p, team: newTeam } : p);
      const teamA_Ids = updatedPlayers.filter(p => p.team === 'A').map(p => p._id);
      const teamB_Ids = updatedPlayers.filter(p => p.team === 'B').map(p => p._id);
      
      const playerName = players.find(p => p._id === playerId).name;
      const teamName = newTeam === 'A' ? "Team A" : newTeam === 'B' ? "Team B" : "Hủy team";
      
      updateTeams(teamA_Ids, teamB_Ids, `Đã xếp ${playerName} vào ${teamName}`);
  };

  const updateTeams = async (teamA_Ids, teamB_Ids, successMsg) => {
      try {
          await axios.put(`${API_PLAYERS}/split`, { adminPass, teamA_Ids, teamB_Ids });
          await fetchPlayers();
          if(successMsg) showToast(successMsg);
      } catch (e) { showToast("Lỗi cập nhật đội hình", "error"); }
  };

  const handleResetTeams = async () => {
      if(!window.confirm("Reset tất cả về danh sách thường?")) return;
      updateTeams([], [], "Đã reset đội hình");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl transform transition-all hover:scale-[1.01]">
            <div className="flex items-center justify-center mb-6 gap-3 flex-wrap">
                <img src={CR7_LOGIN_IMG} alt="Admin" className="w-16 h-16 rounded-full object-cover border-4 border-green-500 p-0.5 shadow-md" />
                <div className="text-left">
                    <h2 className="m-0 font-extrabold text-gray-800 text-lg tracking-tight">HUẤN LUYỆN VIÊN</h2>
                    <p className="m-0 text-gray-500 text-xs font-medium">Khu vực quản lý</p>
                </div>
            </div>
            <input type="password" placeholder="Mật khẩu chiến thuật..." value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
            <button onClick={handleLogin} disabled={loading} 
                className="w-full p-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black hover:shadow-lg transition-all disabled:opacity-70 transform active:scale-95">
                {loading ? 'Đang kiểm tra...' : 'MỞ KHÓA'}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center font-sans">
      <Toast toast={toast} />
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden h-fit border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-wrap gap-3 bg-white">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🛠</span>
                <h1 className="m-0 text-lg text-gray-800 font-bold uppercase tracking-tight">Quản Lý ({players.length})</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
                <button onClick={handleRandomSplit} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all hover:shadow-md active:scale-95">⚡ Random Chia đội</button>
                <button onClick={handleResetTeams} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-all hover:shadow-md active:scale-95">🔄 Reset Chia đội</button>
                <button onClick={handleLogout} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-all hover:shadow-md active:scale-95">Thoát</button>
            </div>
        </div>

        {/* --- PHẦN MỚI: Form Cài Đặt Trận Đấu --- */}
        <div className="p-5 bg-blue-50 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2">
                ⏰ Cài Đặt Trận Đấu
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Địa điểm:</label>
                    <input 
                        type="text" 
                        placeholder="Ví dụ: Sân Mỹ Đình"
                        className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        value={matchInfo.location}
                        onChange={(e) => setMatchInfo({...matchInfo, location: e.target.value})}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Thời gian:</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        value={matchInfo.time}
                        onChange={(e) => setMatchInfo({...matchInfo, time: e.target.value})}
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={handleSaveMatchInfo}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 whitespace-nowrap w-full md:w-auto"
                    >
                        Lưu Cài Đặt
                    </button>
                </div>
            </div>
        </div>
        {/* -------------------------------------- */}

        {/* Table */}
        <div className="overflow-x-auto pb-2">
            <table className="w-full border-collapse min-w-[600px]">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left w-1/3 font-bold">Cầu thủ</th>
                        <th className="p-4 text-center font-bold">Xếp đội</th>
                        <th className="p-4 text-center font-bold">Trạng thái</th>
                        <th className="p-4 text-right font-bold">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                {players.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors group">
                        {/* Tên cầu thủ căn trái */}
                        <td className="p-4 font-bold text-gray-800 align-middle text-left group-hover:text-black">{p.name}</td>
                        
                        <td className="p-4 text-center align-middle">
                            <div className="flex justify-center gap-2">
                                <button onClick={() => handleChangeTeam(p._id, 'A')} 
                                    className={`w-8 h-8 rounded-full font-bold text-xs transition-all duration-200 hover:scale-110 shadow-sm ${p.team === 'A' ? 'bg-rose-600 text-white ring-2 ring-rose-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>A</button>
                                
                                <button onClick={() => handleChangeTeam(p._id, null)} 
                                    className="w-8 h-8 rounded-full font-bold text-xs bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all duration-200 hover:scale-110 shadow-sm">-</button>

                                <button onClick={() => handleChangeTeam(p._id, 'B')} 
                                    className={`w-8 h-8 rounded-full font-bold text-xs transition-all duration-200 hover:scale-110 shadow-sm ${p.team === 'B' ? 'bg-blue-600 text-white ring-2 ring-blue-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>B</button>
                            </div>
                        </td>

                        <td className="p-4 text-center align-middle">
                            {p.hasPaid ? (
                                <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-green-200">Đã ting ting</span>
                            ) : (
                                <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-red-100">Chưa ting ting</span>
                            )}
                        </td>
                        <td className="p-4 text-right align-middle min-w-[150px]">
                            <button onClick={() => togglePay(p._id)} className="mr-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-xs font-bold shadow-sm hover:shadow active:scale-95">Tick</button>
                            <button onClick={() => deletePlayer(p._id)} className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 hover:border-red-300 transition-all text-xs font-bold shadow-sm hover:shadow active:scale-95">Xóa</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
export default AdminPage;