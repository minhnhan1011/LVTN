import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        ShoeStore
      </div>

      {/* Menu */}
      <nav className="nav">
        <Link to="/">Trang chủ</Link>
        <Link to="/">Sản phẩm</Link>
        <Link to="/">Liên hệ</Link>
      </nav>

      {/* Auth */}
      <div className="auth">
        <Link to="/login" className="login-btn">Đăng nhập</Link>
        <Link to="/register" className="register-btn">Đăng ký</Link>
      </div>
    </header>
  );
}

export default Header;