import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../asset/Login.css";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/login", formData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.status === "Success") {
          const vaitro = res.data.user.VaiTro;

          localStorage.setItem("VaiTro", vaitro);

          alert("Đăng nhập thành công");

          if (vaitro === "Admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          alert("Tài khoản hoặc mật khẩu không đúng");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Có lỗi xảy ra trong quá trình đăng nhập.");
      });
  };

const handleGoogleLoginSuccess = async (credentialResponse) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/google-login",
      {
        credential: credentialResponse.credential,
      },
      {
        withCredentials: true,
      }
    );

    if (res.data.status === "Success") {
      const vaitro = res.data.user.VaiTro;

      localStorage.setItem("VaiTro", vaitro);
      alert("Đăng nhập Google thành công");

      if (vaitro === "Admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      alert("Đăng nhập Google thất bại");
    }
  } catch (error) {
    console.error(error);
    alert("Có lỗi xảy ra trong quá trình đăng nhập.");
  }
};

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1 className="logo-signin">ĐĂNG NHẬP</h1>

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

        <button type="submit">Đăng nhập</button>

        <a href="/" className="forgot">
          Quên mật khẩu?
        </a>

        <hr />
        <div className= "google-login-container">
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => {
          alert("Đăng nhập thất bại");
        }} />
        </div>

        <Link to="/signup" className="create-btn">
          Tạo tài khoản mới
        </Link>
      </form>
    </div>
  );
}

export default Login;
