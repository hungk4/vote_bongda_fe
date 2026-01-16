// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./UserPage";
import AdminPage from "./AdminPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserPage />} />

        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
