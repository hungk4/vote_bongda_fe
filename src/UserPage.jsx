import { useState, useEffect } from "react";
import axios from "axios";
// Nhớ import API_MATCH vào đây
import { API_PLAYERS, BANK_INFO, API_MATCH } from "./config";
import { getClientId } from "./helper/getClientId";

const CR7_BANNER =
  "https://cdn.images.express.co.uk/img/dynamic/67/590x/secondary/Man-Utd-news-Cristiano-Ronaldo-SIU-celebration-Brighton-goal-3918291.jpg?r=1645034779588";

function UserPage() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");

  const [hasVoted, setHasVoted] = useState(false); // Trạng thái đã vote chưa
  const clientId = getClientId();

  // Biến loading này trong logic gốc của bạn chưa dùng, nhưng mình cứ giữ nguyên
  const [loading, setLoading] = useState(false);

  // --- STATE Thông tin trận đấu ---
  const [matchInfo, setMatchInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetchPlayers();
    fetchMatchInfo();
    checkVoteStatus();
  }, []);

  const checkVoteStatus = async () => {
    try {
      const res = await axios.get(
        `${API_PLAYERS}/check-status?clientId=${clientId}`
      );
      setHasVoted(res.data.hasVoted);
    } catch (err) {
      console.error(err);
    }
  };

  // Logic đếm ngược thời gian
  useEffect(() => {
    if (!matchInfo || !matchInfo.time) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const matchTime = new Date(matchInfo.time).getTime();
      const distance = matchTime - now;

      if (distance < 0) {
        setTimeLeft("TRẬN ĐẤU ĐANG DIỄN RA");
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format hiển thị đẹp hơn
        const h = hours < 10 ? `0${hours}` : hours;
        const m = minutes < 10 ? `0${minutes}` : minutes;
        const s = seconds < 10 ? `0${seconds}` : seconds;

        setTimeLeft(days > 0 ? `${days}d ${h}:${m}:${s}` : `${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [matchInfo]);

  const fetchMatchInfo = async () => {
    try {
      const res = await axios.get(API_MATCH);
      setMatchInfo(res.data);
    } catch (error) {
      console.error("Chưa có thông tin trận đấu");
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await axios.get(API_PLAYERS);
      setPlayers(res.data);
    } catch (e) {
      console.error("Lỗi server");
    }
  };

  // Hàm xử lý khi nhấn nút (Gộp cả logic Tham gia và Hủy)
  const handleAction = async () => {
    if (hasVoted) {
      // --- LOGIC HỦY VOTE ---
      if (!window.confirm("Bạn chắc chắn muốn hủy tham gia?")) return;
      try {
        await axios.post(`${API_PLAYERS}/unvote`, { clientId });
        alert("Đã hủy tham gia!");
        setHasVoted(false);
        fetchPlayers(); // Tải lại danh sách
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi hủy vote");
      }
    } else {
      // --- LOGIC THAM GIA ---
      if (!name.trim()) return alert("Vui lòng nhập tên!");
      try {
        await axios.post(API_PLAYERS, {
          name,
          clientId,
        });
        alert("Đăng ký thành công!");
        setHasVoted(true);
        setName(""); // Xóa ô nhập
        fetchPlayers();
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi đăng ký");
      }
    }
  };

  const generateQR = () => {
    const content = `Da bong`;
    const { BANK_ID, ACCOUNT_NO, TEMPLATE, AMOUNT } = BANK_INFO;
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${encodeURIComponent(
      content
    )}`;
  };

  // Logic thống kê
  const totalPaid = players.filter((p) => p.hasPaid).length;
  const hasTeams = players.some((p) => p.team);
  const teamA = players.filter((p) => p.team === "A");
  const teamB = players.filter((p) => p.team === "B");

  // --- Component Thẻ Cầu Thủ (Đã nâng cấp CSS) ---
  const PlayerCard = ({ p, index, isMini = false }) => (
    <div
      className={`relative group flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 mb-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
        isMini ? "p-2" : "p-3"
      }`}
    >
      {/* Thanh trạng thái màu bên trái */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          p.hasPaid ? "bg-emerald-500" : "bg-amber-400"
        }`}
      ></div>

      <div className="flex items-center gap-3 flex-1 min-w-0 pl-2">
        {!isMini && (
          <div className="w-8 h-8 flex-shrink-0 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold border border-slate-200 shadow-inner">
            {index + 1}
          </div>
        )}
        <div className="flex flex-col">
          <span
            className={`${
              isMini ? "text-sm" : "text-base"
            } font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors`}
          >
            {p.name}
          </span>
        </div>
      </div>

      {!isMini && (
        <span
          className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex-shrink-0 tracking-wide border shadow-sm ${
            p.hasPaid
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          }`}
        >
          {p.hasPaid ? "Đã ting ting" : "Chưa ting ting"}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans py-4 sm:py-8 px-2 sm:px-0">
      <div className="w-full max-w-[480px] bg-white min-h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
        
        {/* Banner Section */}
        <div className="h-72 relative overflow-hidden flex-shrink-0 group">
          <img
            src={CR7_BANNER}
            alt="Banner"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient Overlay đậm hơn để chữ rõ hơn */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          {/* Nội dung trên Banner */}
          <div className="absolute inset-0 flex flex-col justify-end items-center text-center pb-6 px-4">
            <h1 className="text-white uppercase tracking-widest text-2xl font-black drop-shadow-lg mb-3">
              ⚽ Kèo Bóng Đá
            </h1>

            {/* Đồng hồ đếm ngược - Style Glassmorphism */}
            {timeLeft && (
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-2 mb-4 shadow-lg">
                <div className="text-yellow-400 font-mono font-bold text-2xl leading-none tracking-widest drop-shadow-md">
                  {timeLeft}
                </div>
                <div className="text-slate-300 text-[10px] font-medium uppercase tracking-widest mt-1">
                  Thời gian thi đấu
                </div>
              </div>
            )}

            {/* Badges Thông tin trận đấu */}
            <div className="flex gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold shadow-sm">
                <span>📍</span> {matchInfo?.location || "Sân chưa chốt"}
              </div>

              {matchInfo?.time && (
                <div className="flex items-center gap-1 bg-blue-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold shadow-sm">
                  <span>⏰</span> {new Date(matchInfo.time).getHours()}h
                  {String(new Date(matchInfo.time).getMinutes()).padStart(2,"0")}
                </div>
              )}

              <div className="flex items-center gap-1 bg-emerald-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold shadow-sm">
                <span>💰</span> {totalPaid}/{players.length}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 bg-slate-50/50">
          {/* Form Đăng Ký - Sticky Top */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] mb-8 sticky top-4 z-20 border border-slate-100">
            <h2 className={`text-lg font-bold mb-4 text-center uppercase tracking-wide ${hasVoted ? 'text-emerald-600' : 'text-blue-600'}`}>
              {hasVoted ? "🎉 Bạn đã ghi danh!" : "Đăng Ký Tham Gia"}
            </h2>

            {!hasVoted && (
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none text-slate-700 font-medium placeholder-slate-400"
                  placeholder="Nhập tên thánh vào đây..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={handleAction}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${
                hasVoted
                  ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200 hover:shadow-red-300"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:shadow-blue-300"
              }`}
            >
              {hasVoted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  HỦY KÈO
                </>
              ) : (
                <>
                  THAM GIA NGAY ⚽
                </>
              )}
            </button>
          </div>

          {/* PHẦN 1: KẾT QUẢ CHIA ĐỘI */}
          {hasTeams && (
            <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <h3 className="text-slate-800 text-sm font-black uppercase tracking-wider">
                  Đội hình ra sân
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              <div className="flex gap-4 items-start">
                {/* Team A */}
                <div className="flex-1 bg-rose-50/50 p-3 rounded-2xl border border-rose-100 shadow-sm">
                  <div className="text-rose-600 text-center text-xs font-black mb-3 uppercase tracking-wider bg-rose-100/50 py-1 rounded-lg">
                    🔴 Team A ({teamA.length})
                  </div>
                  <div className="space-y-1">
                    {teamA.map((p, i) => (
                      <PlayerCard key={p._id} p={p} index={i} isMini={true} />
                    ))}
                  </div>
                </div>
                
                {/* Team B */}
                <div className="flex-1 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="text-blue-600 text-center text-xs font-black mb-3 uppercase tracking-wider bg-blue-100/50 py-1 rounded-lg">
                    🔵 Team B ({teamB.length})
                  </div>
                  <div className="space-y-1">
                    {teamB.map((p, i) => (
                      <PlayerCard key={p._id} p={p} index={i} isMini={true} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHẦN 2: DANH SÁCH ĐĂNG KÝ */}
          <div>
            <div className="flex justify-between items-end mb-4 px-1">
              <h3 className="text-slate-800 font-black text-lg">
                Danh Sách Siêu Sao
              </h3>
              <span className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                Total: {players.length}
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar pb-10">
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm font-medium">Chưa có ai đăng ký</p>
                  <p className="text-xs mt-1">Mở bát đi bạn ơi! 🚀</p>
                </div>
              ) : (
                players.map((p, index) => (
                  <PlayerCard key={p._id} p={p} index={index} />
                ))
              )}
            </div>
          </div>

          {/* QR Code Section - Đã cập nhật cho ra giữa */}
          <div className="mt-8 pt-8 border-t border-dashed border-slate-300">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
              
              {/* Trang trí background */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-200/20 rounded-full blur-2xl"></div>

              <p className="mb-4 font-bold text-emerald-800 text-sm uppercase tracking-wide">
                Quét mã ting ting <br/>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {BANK_INFO.AMOUNT.toLocaleString()}đ
                </span>
              </p>
              
              <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-emerald-50 mb-3">
                <img
                  src={generateQR()}
                  alt="QR Code"
                  className="w-40 h-40 block rounded-lg"
                />
              </div>
              
              <div className="inline-flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Nội dung:</span>
                <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">Da bong</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserPage;