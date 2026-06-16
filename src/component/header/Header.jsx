import "./Header.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Header() {
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);

  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.HoTen);
          localStorage.setItem("MaNguoiDung", res.data.MaNguoiDung);
        } else {
          setAuth(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <header className="header">
      <div className="logo">ShoeStore</div>

      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/productpage">Sản phẩm</Link>
        <Link to="/">Liên hệ</Link>
      </nav>

      <div className="auth">
        <Link to="/cart" className="cart-btn">
          Giỏ hàng
        </Link>

        {auth ? (
          <>
            <span>Xin chào, {name}</span>
            <button onClick={handleLogout}>Đăng xuất</button>
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