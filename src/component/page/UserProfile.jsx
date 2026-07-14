import React, { useEffect, useState } from "react";
import "../asset/UserProfile.css";
import { useNavigate } from "react-router-dom";
import Headers from "../header/Header";
import axios from "axios";

function UserProfile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    MatKhau: "",
  });

  const [loading, setLoading] = useState(true);

  const MaNguoiDung = localStorage.getItem("MaNguoiDung");

  useEffect(() => {
    if (!MaNguoiDung) {
      alert("Bạn chưa đăng nhập");
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:5000/users/${MaNguoiDung}`, {
        withCredentials: true,
      })
      .then((res) => {
        setUserData({
          HoTen: res.data.HoTen || "",
          Email: res.data.Email || "",
          SoDienThoai: res.data.SoDienThoai || "",
          MatKhau: res.data.MatKhau || "",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alert("Không thể tải thông tin người dùng");
        setLoading(false);
      });
  }, [MaNguoiDung, navigate]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      userData.HoTen.trim() === "" ||
      userData.Email.trim() === "" ||
      userData.MatKhau.trim() === ""
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/users/${MaNguoiDung}`,
        userData,
        {
          withCredentials: true,
        }
      );

      alert(res.data.message || "Cập nhật thông tin thành công");
      window.location.reload();
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Cập nhật thông tin thất bại");
    }
  };

  if (loading) {
    return <p className="profile-loading">Đang tải thông tin...</p>;
  }

  return (
    <> 
    <Headers /> 
    <div className="profile-page">
      <div className="profile-card">
        <h1>Thông tin cá nhân</h1>

        <form className="profile-form" onSubmit={handleUpdate}>
          <div className="profile-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="HoTen"
              value={userData.HoTen}
              onChange={handleChange}
            />
          </div>

          <div className="profile-group">
            <label>Email</label>
            <input
              type="email"
              name="Email"
              value={userData.Email}
              onChange={handleChange}
            />
          </div>

          <div className="profile-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="SoDienThoai"
              value={userData.SoDienThoai}
              onChange={handleChange}
            />
          </div>

          <div className="profile-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="MatKhau"
              value={userData.MatKhau}
              onChange={handleChange}
            />
          </div>

          <div className="profile-actions">
            <button type="submit" className="profile-save-btn">
              Lưu thay đổi
            </button>

            <button
              type="button"
              className="profile-back-btn"
              onClick={() => navigate("/")}
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
</>

  );
  
}
export default UserProfile;