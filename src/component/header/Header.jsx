import "./Header.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Header() {
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);
  const [id_user, setId_user] = useState("");

  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth", { withCredentials: true });
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.HoTen);
          setId_user(res.data.MaNguoiDung);
        } else {
          setAuth(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkToken();
  }, []);

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">ShoeStore</div>

      {/* Menu */}
      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/productpage">Sản phẩm</Link>
        <Link to="/">Liên hệ</Link>
      </nav>

      {/* Auth */}
      <div className="auth">
        {auth ? (
          <>
            <span className="text-white">Xin chào, {name}</span>
            <button type="submit" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
