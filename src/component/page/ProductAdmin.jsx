import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../asset/Products.css";

function ProductAdmin() {
  const [showForm, setShowForm] = useState(false);

  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/products/${id}`);
      alert("Xóa thành công");
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert("Xóa thất bại");
    }
  };

  const [values, setValues] = useState({
    TenSanPham: "",
    MaLoaiSanPham: "",
    MaThuongHieu: "",
    MaMauSac: "",
    MaSize: "",
    DonGia: "",
    SoLuong: "",
    HinhAnh: null,
  });

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/admin/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();

    axios
      .get("http://localhost:5000/admin/product-types")
      .then((res) => setProductTypes(res.data));

    axios
      .get("http://localhost:5000/admin/brands")
      .then((res) => setBrands(res.data));

    axios
      .get("http://localhost:5000/admin/colors")
      .then((res) => setColors(res.data));

    axios
      .get("http://localhost:5000/admin/sizes")
      .then((res) => setSizes(res.data));
  }, []);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    setValues({
      ...values,
      HinhAnh: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("TenSanPham", values.TenSanPham);
    formData.append("MaLoaiSanPham", values.MaLoaiSanPham);
    formData.append("MaThuongHieu", values.MaThuongHieu);
    formData.append("MaMauSac", values.MaMauSac);
    formData.append("MaSize", values.MaSize);
    formData.append("DonGia", values.DonGia);
    formData.append("SoLuong", values.SoLuong);
    formData.append("MoTa", values.MoTa);
    formData.append("HinhAnh", values.HinhAnh);

    await axios.post("http://localhost:5000/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Thêm sản phẩm thành công");

    setValues({
      TenSanPham: "",
      MaLoaiSanPham: "",
      MaThuongHieu: "",
      MaMauSac: "",
      MaSize: "",
      DonGia: "",
      SoLuong: "",
      MoTa: "",
      HinhAnh: null,
    });

    setShowForm(false);
    fetchProducts();
  };

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
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <h2>Thêm sản phẩm</h2>

            <input
              type="text"
              name="TenSanPham"
              placeholder="Tên sản phẩm"
              value={values.TenSanPham}
              onChange={handleChange}
              required
            />

            <select
              name="MaLoaiSanPham"
              value={values.MaLoaiSanPham}
              onChange={handleChange}
              required
            >
              <option value="">Chọn loại sản phẩm</option>
              {productTypes.map((item) => (
                <option key={item.MaLoaiSanPham} value={item.MaLoaiSanPham}>
                  {item.TenLoaiSanPham}
                </option>
              ))}
            </select>

            <select
              name="MaThuongHieu"
              value={values.MaThuongHieu}
              onChange={handleChange}
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((item) => (
                <option key={item.MaThuongHieu} value={item.MaThuongHieu}>
                  {item.TenThuongHieu}
                </option>
              ))}
            </select>

            <select
              name="MaMauSac"
              value={values.MaMauSac}
              onChange={handleChange}
              required
            >
              <option value="">Chọn màu sắc</option>
              {colors.map((item) => (
                <option key={item.MaMauSac} value={item.MaMauSac}>
                  {item.TenMauSac}
                </option>
              ))}
            </select>

            <select
              name="MaSize"
              value={values.MaSize}
              onChange={handleChange}
              required
            >
              <option value="">Chọn size</option>
              {sizes.map((item) => (
                <option key={item.MaSize} value={item.MaSize}>
                  {item.TenSize}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="DonGia"
              placeholder="Đơn giá"
              value={values.DonGia}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="SoLuong"
              placeholder="Số lượng"
              value={values.SoLuong}
              onChange={handleChange}
              required
            />

            <textarea
              name="MoTa"
              placeholder="Mô tả"
              value={values.MoTa}
              onChange={handleChange}
            />

            <input
              type="file"
              name="HinhAnh"
              accept="image/*"
              onChange={handleFile}
              required
            />

            <button type="submit" className="admin-submit-btn">
              Lưu sản phẩm
            </button>
          </form>
        )}

        <table className="admin-product-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Loại</th>
              <th>Thương hiệu</th>
              <th>Màu</th>
              <th>Size</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Số lượng</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr key={item.MaSanPham}>
                <td>
                  {item.DuongDan && (
                    <img
                      src={`http://localhost:5000${item.DuongDan}`}
                      alt={item.TenSanPham}
                      width="60"
                    />
                  )}
                </td>
                <td>{item.MaSanPham}</td>
                <td>{item.TenSanPham}</td>
                <td>{item.TenLoaiSanPham}</td>
                <td>{item.TenThuongHieu}</td>
                <td>{item.TenMauSac}</td>
                <td>{item.TenSize}</td>
                <td>{Number(item.DonGia).toLocaleString()}đ</td>
                <td>{item.MoTa}</td>
                <td>{item.SoLuong}</td>
                <td>
                  <button>Sửa</button>
                  <button onClick={() => handleDelete(item.MaSanPham)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default ProductAdmin;
