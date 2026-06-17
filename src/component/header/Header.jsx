import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Header() {
  const [name, setName] = useState("");
  const [auth, setAuth] = useState(false);
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (keyword.trim() === "") return;

    navigate(`/productpage?search=${keyword.trim()}`);
    setKeyword("");
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
      <Link to="/" className="logo">
        ShoeStore
      </Link>

      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/productpage">Sản phẩm</Link>
        <Link to="/">Liên hệ</Link>
      </nav>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Tìm giày..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit">Tìm</button>
      </form>

      <div className="auth">
        <Link to="/cart" className="cart-btn">
          Giỏ hàng
        </Link>

        {auth ? (
          <>
            <span className="hello-text">Xin chào, {name}</span>
            <button className="logout-btn" onClick={handleLogout}>
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