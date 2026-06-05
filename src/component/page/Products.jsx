import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../asset/Products.css";

function Products() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>

        <nav className="admin-nav">
          <Link to="/admin">Tổng quan</Link>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
          <Link to="/">Về trang chủ</Link>
        </nav>
      </aside>

      <main className="admin-content">
        <div className="admin-product-header">
          <h1>Quản lý sản phẩm</h1>

          <button
            className="admin-add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Đóng" : "+ Thêm sản phẩm"}
          </button>
        </div>

        {showForm && (
          <form className="admin-product-form">
            <h2>Thêm sản phẩm</h2>

            <input type="text" name="MaLoaiSanPham" placeholder="Mã loại sản phẩm" />
            <input type="text" name="TenSanPham" placeholder="Tên sản phẩm" />
            <input type="text" name="MaThuongHieu" placeholder="Mã thương hiệu" />

            <select name="GioiTinh">
              <option value="Unisex">Unisex</option>
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
            </select>

            <textarea name="MoTa" placeholder="Mô tả sản phẩm"></textarea>

            <input type="text" name="MaSanPham" placeholder="Mã sản phẩm" />
            <input type="text" name="MaMauSac" placeholder="Mã màu sắc" />
            <input type="text" name="MaSize" placeholder="Mã size" />
            <input type="number" name="DonGia" placeholder="Đơn giá" />
            <input type="number" name="SoLuong" placeholder="Số lượng" />

            <button type="submit" className="admin-submit-btn">
              Lưu sản phẩm
            </button>
          </form>
        )}

        <table className="admin-product-table">
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Test sản phẩm</td>
              <td>500.000đ</td>
              <td>10</td>
              <td>
                <button className="admin-edit-btn">Sửa</button>
                <button className="admin-delete-btn">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Products;