import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../asset/Signup.css";

function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    MatKhau: "",
    XacNhanMatKhau: "",
  });

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(values.Email)) {
      alert("Vui lòng nhập đúng định dạng email");
      return;
    }

    if(values.MatKhau.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (values.MatKhau !== values.XacNhanMatKhau) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/signup",
        values
      );

      if (res.data.status === "Success") {
        alert("Đăng ký thành công");
        navigate("/login");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>ĐĂNG KÝ</h1>

        <input
          type="text"
          name="HoTen"
          placeholder="Họ và tên"
          onChange={handleChange}
        />

        <input
          type="email"
          name="Email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="text"
          name="SoDienThoai"
          placeholder="Số điện thoại"
          onChange={handleChange}
        />

        <input
          type="password"
          name="MatKhau"
          placeholder="Mật khẩu"
          onChange={handleChange}
        />

        <input
          type="password"
          name="XacNhanMatKhau"
          placeholder="Xác nhận mật khẩu"
          onChange={handleChange}
        />

        <button type="submit">Đăng ký</button>

        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;