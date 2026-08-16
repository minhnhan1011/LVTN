import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import axios from "axios";
import "../asset/Login.css";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.status !== "Success") {
        alert(
          res.data.message ||
            "Tài khoản hoặc mật khẩu không đúng",
        );
        return;
      }

      const user = res.data.user;
      const vaitro = user.VaiTro;
      const MaNguoiDung = user.MaNguoiDung;

      // Lưu thông tin người dùng
      localStorage.setItem("VaiTro", vaitro);
      localStorage.setItem(
        "MaNguoiDung",
        String(MaNguoiDung),
      );

      // Xóa giỏ hàng guest sau khi đăng nhập
      localStorage.removeItem("guestCart");

      // Admin
      if (vaitro === "Admin") {
        alert("Đăng nhập thành công");
        navigate("/admin");
        return;
      }

      alert("Đăng nhập thành công");

      // Nếu đi từ trang giỏ hàng sang login thì quay lại giỏ hàng
      const redirectTo =
        location.state?.redirectTo || "/";

      navigate(redirectTo);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        alert(err.response.data.message);
      } else {
        alert(
          err.response?.data?.message ||
            "Có lỗi xảy ra trong quá trình đăng nhập.",
        );
      }
    }
  };

  const handleGoogleLoginSuccess = async (
    credentialResponse,
  ) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/google-login",
        {
          credential: credentialResponse.credential,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.status !== "Success") {
        alert("Đăng nhập Google thất bại");
        return;
      }

      const user = res.data.user;
      const vaitro = user.VaiTro;
      const MaNguoiDung = user.MaNguoiDung;

      // Lưu thông tin người dùng
      localStorage.setItem("VaiTro", vaitro);
      localStorage.setItem(
        "MaNguoiDung",
        String(MaNguoiDung),
      );

      // Xóa giỏ hàng guest sau khi đăng nhập Google
      localStorage.removeItem("guestCart");

      if (vaitro === "Admin") {
        alert("Đăng nhập Google thành công");
        navigate("/admin");
        return;
      }

      alert("Đăng nhập Google thành công");

      const redirectTo =
        location.state?.redirectTo || "/";

      navigate(redirectTo);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Có lỗi xảy ra trong quá trình đăng nhập.",
      );
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={handleLogin}
      >
        <h1 className="logo-signin">
          ĐĂNG NHẬP
        </h1>

        <label>
          <input
            type="text"
            name="username"
            placeholder="Email hoặc số điện thoại"
            value={formData.username}
            onChange={handleChange}
          />
        </label>

        <label>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit">
          Đăng nhập
        </button>

        <hr />

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              alert("Đăng nhập thất bại");
            }}
          />
        </div>

        <Link
          to="/signup"
          className="create-btn"
        >
          Tạo tài khoản mới
        </Link>
      </form>
    </div>
  );
}

export default Login;