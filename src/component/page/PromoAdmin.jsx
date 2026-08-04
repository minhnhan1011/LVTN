import React, { useEffect, useState } from "react";
import "../asset/PromoAdmin.css";
import { Link } from "react-router-dom";
import axios from "axios";

function PromoAdmin() {
  const [promotions, setPromotions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  const loadPromotions = () => {
    axios
      .get("http://localhost:5000/admin/promotions")
      .then((res) => {
        setPromotions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleAddPromotion = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = {
      TenKhuyenMai: formData.get("tenKhuyenMai"),
      LoaiGiamGia: formData.get("loaiGiamGia"),
      GiaTriGiam: formData.get("giaTriGiam"),
      NgayBatDau: formData.get("ngayBatDau"),
      NgayKetThuc: formData.get("ngayKetThuc"),
    };

    axios
      .post("http://localhost:5000/admin/promotions", data)
      .then((res) => {
        console.log(res.data);
        loadPromotions();
        setShowForm(false);
        e.target.reset();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeletePromotion = (id) => {
    axios
      .delete(`http://localhost:5000/admin/promotions/${id}`)
      .then((res) => {
        console.log(res.data);
        loadPromotions();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const formatPrice = (value) => {
    return Number(value).toLocaleString("vi-VN");
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>

        <nav className="admin-nav">
          <Link to="/admin">Quản lý User</Link>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
          <Link to="/admin/order">Quản lý đơn hàng</Link>
          <Link to="/admin/promo">Quản lý khuyến mãi</Link>

          <Link to="/" onClick={handleLogout}>
            Đăng xuất
          </Link>
        </nav>
      </aside>

      <main className="promo-content">
        <div className="promo-header">
          <div>
            <h1>Quản lý khuyến mãi</h1>
            <p>Danh sách các chương trình khuyến mãi</p>
          </div>

          <button
            className="btn-add-promo"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Đóng" : "Thêm khuyến mãi"}
          </button>
        </div>

        {showForm && (
          <div className="promo-form">
            <h2>Thêm khuyến mãi</h2>

            <form onSubmit={handleAddPromotion}>
              <div className="form-group">
                <label htmlFor="tenKhuyenMai">Tên khuyến mãi:</label>
                <input
                  type="text"
                  id="tenKhuyenMai"
                  name="tenKhuyenMai"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="loaiGiamGia">Loại giảm:</label>
                <select id="loaiGiamGia" name="loaiGiamGia" required>
                  <option value="PhanTram">Phần trăm</option>
                  <option value="SoTien">Số tiền</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="giaTriGiam">Giá trị giảm:</label>
                <input
                  type="number"
                  id="giaTriGiam"
                  name="giaTriGiam"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngayBatDau">Ngày bắt đầu:</label>
                <input
                  type="date"
                  id="ngayBatDau"
                  name="ngayBatDau"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ngayKetThuc">Ngày kết thúc:</label>
                <input
                  type="date"
                  id="ngayKetThuc"
                  name="ngayKetThuc"
                  required
                />
              </div>

              <button type="submit" className="btn-add-promo">
                Thêm khuyến mãi
              </button>
            </form>
          </div>
        )}

        <div className="promo-table-wrapper">
          <table className="promo-table">
            <thead>
              <tr>
                <th>Tên khuyến mãi</th>
                <th>Loại giảm</th>
                <th>Giá trị giảm</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {promotions.length > 0 ? (
                promotions.map((item) => (
                  <tr key={item.MaKhuyenMai}>
                    {/* <td>{item.MaKhuyenMai}</td> */}

                    <td>{item.TenKhuyenMai}</td>

                    <td>
                      {item.LoaiGiamGia === "PhanTram"
                        ? "Phần trăm"
                        : "Số tiền"}
                    </td>

                    <td>
                      {item.LoaiGiamGia === "PhanTram"
                        ? `${item.GiaTriGiam}%`
                        : `${formatPrice(item.GiaTriGiam)} đ`}
                    </td>

                    <td>{formatDate(item.NgayBatDau)}</td>

                    <td>{formatDate(item.NgayKetThuc)}</td>

                    <td>
                      <span
                        className={
                          item.TrangThai === "HoatDong"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {item.TrangThai === "HoatDong"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>

                    <td>
                      <div className="promo-actions">
                        <button className="btn-edit">Sửa</button>

                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleDeletePromotion(item.MaKhuyenMai)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-promo">
                    Chưa có khuyến mãi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default PromoAdmin;
