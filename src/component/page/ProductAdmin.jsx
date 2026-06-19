import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../asset/ProductsAdmin.css";

function ProductAdmin() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);

  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [values, setValues] = useState({
    TenSanPham: "",
    MaLoaiSanPham: "",
    MaThuongHieu: "",
    DonGia: "",
    MoTa: "",
    HinhAnh: null,
  });

  const [variants, setVariants] = useState([
    { MaMauSac: "", MaSize: "", SoLuong: "" },
  ]);

  const [editValues, setEditValues] = useState({
    MaSanPham: "",
    TenSanPham: "",
    MaLoaiSanPham: "",
    MaThuongHieu: "",
    DonGia: "",
    MoTa: "",
    KhuyenMai: 0,
  });

  const [currentProductId, setCurrentProductId] = useState("");
  const [editVariants, setEditVariants] = useState([]);

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/products");
      setProducts(res.data);
    } catch (err) {
      console.log("Lỗi lấy sản phẩm:", err);
    }
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
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setValues({ ...values, HinhAnh: e.target.files[0] });
  };

  const handleVariantChange = (index, e) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [e.target.name]: e.target.value,
    };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { MaMauSac: "", MaSize: "", SoLuong: "" }]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      alert("Phải có ít nhất 1 biến thể");
      return;
    }

    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(values.DonGia) <= 0) {
      alert("Đơn giá phải lớn hơn 0");
      return;
    }

    for (let item of variants) {
      if (!item.MaMauSac || !item.MaSize || item.SoLuong === "") {
        alert("Vui lòng nhập đầy đủ màu, size và số lượng");
        return;
      }

      if (Number(item.SoLuong) <= 0) {
        alert("Số lượng phải lớn hơn 0");
        return;
      }
    }

    const formData = new FormData();

    formData.append("TenSanPham", values.TenSanPham);
    formData.append("MaLoaiSanPham", values.MaLoaiSanPham);
    formData.append("MaThuongHieu", values.MaThuongHieu);
    formData.append("DonGia", values.DonGia);
    formData.append("MoTa", values.MoTa);
    formData.append("variants", JSON.stringify(variants));

    if (values.HinhAnh) {
      formData.append("HinhAnh", values.HinhAnh);
    }

    try {
      await axios.post("http://localhost:5000/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Thêm sản phẩm thành công");

      setValues({
        TenSanPham: "",
        MaLoaiSanPham: "",
        MaThuongHieu: "",
        DonGia: "",
        MoTa: "",
        HinhAnh: null,
      });

      setVariants([{ MaMauSac: "", MaSize: "", SoLuong: "" }]);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Thêm sản phẩm thất bại");
    }
  };

  const handleEditClick = (item) => {
    setShowEditForm(true);
    setShowForm(false);
    setShowVariantForm(false);

    setEditValues({
      MaSanPham: item.MaSanPham,
      TenSanPham: item.TenSanPham,
      MaLoaiSanPham: item.MaLoaiSanPham || "",
      MaThuongHieu: item.MaThuongHieu || "",
      DonGia: item.DonGia,
      MoTa: item.MoTa || "",
      KhuyenMai: item.KhuyenMai || 0,
    });
  };

  const handleEditChange = (e) => {
    setEditValues({
      ...editValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (Number(editValues.DonGia) <= 0) {
      alert("Đơn giá phải lớn hơn 0");
      return;
    }

    if (![0, 10, 20, 50].includes(Number(editValues.KhuyenMai))) {
      alert("Khuyến mãi chỉ được chọn 0%, 10%, 20% hoặc 50%");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/admin/products/${editValues.MaSanPham}`,
        editValues,
      );

      alert("Cập nhật sản phẩm thành công");
      setShowEditForm(false);
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleEditVariantClick = async (item) => {
    setShowVariantForm(true);
    setShowEditForm(false);
    setShowForm(false);
    setCurrentProductId(item.MaSanPham);

    try {
      const res = await axios.get(
        `http://localhost:5000/admin/products/${item.MaSanPham}/variants`,
      );

      setEditVariants(res.data);
    } catch (err) {
      console.log(err);
      alert("Lỗi lấy biến thể sản phẩm");
    }
  };

  const handleEditVariantChange = (index, e) => {
    const newVariants = [...editVariants];

    newVariants[index] = {
      ...newVariants[index],
      [e.target.name]: e.target.value,
    };

    setEditVariants(newVariants);
  };

  const handleUpdateVariants = async (e) => {
    e.preventDefault();

    for (let item of editVariants) {
      if (!item.MaMauSac || !item.MaSize || item.SoLuong === "") {
        alert("Vui lòng nhập đầy đủ màu, size và số lượng");
        return;
      }

      if (Number(item.SoLuong) < 0) {
        alert("Số lượng không được nhỏ hơn 0");
        return;
      }
    }

    try {
      await axios.put(
        `http://localhost:5000/admin/products/${currentProductId}/variants`,
        { variants: editVariants },
      );

      alert("Cập nhật biến thể thành công");
      setShowVariantForm(false);
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Cập nhật biến thể thất bại");
    }
  };

  const handleHideProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn ẩn sản phẩm này?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/products/${id}`);
      alert("Đã ẩn sản phẩm");
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Ẩn sản phẩm thất bại");
    }
  };

  const calcDiscountPrice = (price, discount) => {
    return Number(price) - (Number(price) * Number(discount || 0)) / 100;
  };

  const handleShowProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hiện lại sản phẩm này?")) return;

    try {
      await axios.put(`http://localhost:5000/admin/products/${id}/show`);
      alert("Đã hiện sản phẩm");
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Hiện sản phẩm thất bại");
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>

        <nav className="admin-nav">
          <Link to="/admin">Quản lý User</Link>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
          <Link to="/admin/order">Quản lý đơn hàng</Link>
          <Link to="/" onClick={handleLogout}>
            Đăng xuất
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        <div className="admin-product-header">
          <h1>Quản lý sản phẩm</h1>

          <button
            className="admin-add-btn"
            onClick={() => {
              setShowForm(!showForm);
              setShowEditForm(false);
              setShowVariantForm(false);
            }}
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

            <input
              type="number"
              name="DonGia"
              min="1"
              placeholder="Đơn giá gốc"
              value={values.DonGia}
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

            <div className="variant-box">
              <h3>Biến thể sản phẩm</h3>

              {variants.map((variant, index) => (
                <div className="variant-row" key={index}>
                  <select
                    name="MaMauSac"
                    value={variant.MaMauSac}
                    onChange={(e) => handleVariantChange(index, e)}
                    required
                  >
                    <option value="">Chọn màu</option>
                    {colors.map((item) => (
                      <option key={item.MaMauSac} value={item.MaMauSac}>
                        {item.TenMauSac}
                      </option>
                    ))}
                  </select>

                  <select
                    name="MaSize"
                    value={variant.MaSize}
                    onChange={(e) => handleVariantChange(index, e)}
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
                    name="SoLuong"
                    min="1"
                    placeholder="Số lượng"
                    value={variant.SoLuong}
                    onChange={(e) => handleVariantChange(index, e)}
                    required
                  />

                  <button
                    type="button"
                    className="variant-remove-btn"
                    onClick={() => removeVariant(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="variant-add-btn"
                onClick={addVariant}
              >
                + Thêm màu / size
              </button>
            </div>

            <button type="submit" className="admin-submit-btn">
              Lưu sản phẩm
            </button>
          </form>
        )}

        {showEditForm && (
          <form className="admin-product-form" onSubmit={handleUpdateProduct}>
            <h2>Sửa sản phẩm</h2>

            <input
              type="text"
              name="TenSanPham"
              placeholder="Tên sản phẩm"
              value={editValues.TenSanPham}
              onChange={handleEditChange}
              required
            />

            <select
              name="MaLoaiSanPham"
              value={editValues.MaLoaiSanPham}
              onChange={handleEditChange}
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
              value={editValues.MaThuongHieu}
              onChange={handleEditChange}
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((item) => (
                <option key={item.MaThuongHieu} value={item.MaThuongHieu}>
                  {item.TenThuongHieu}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="DonGia"
              min="1"
              placeholder="Giá gốc"
              value={editValues.DonGia}
              onChange={handleEditChange}
              required
            />

            <select
              name="KhuyenMai"
              value={editValues.KhuyenMai}
              onChange={handleEditChange}
            >
              <option value="0">Không khuyến mãi</option>
              <option value="10">Giảm 10%</option>
              <option value="20">Giảm 20%</option>
              <option value="50">Giảm 50%</option>
            </select>

            <textarea
              name="MoTa"
              placeholder="Mô tả"
              value={editValues.MoTa}
              onChange={handleEditChange}
            />

            <div className="discount-preview">
              Giá sau khuyến mãi:{" "}
              <strong>
                {calcDiscountPrice(
                  editValues.DonGia || 0,
                  editValues.KhuyenMai || 0,
                ).toLocaleString()}
                đ
              </strong>
            </div>

            <button type="submit" className="admin-submit-btn">
              Lưu cập nhật
            </button>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => setShowEditForm(false)}
            >
              Hủy
            </button>
          </form>
        )}

        {showVariantForm && (
          <form
            className="admin-product-form variant-form"
            onSubmit={handleUpdateVariants}
          >
            <h2 className="variant-form-title">Quản lý tồn kho sản phẩm</h2>

            {editVariants.map((variant, index) => (
              <div className="variant-row" key={variant.MaBienThe}>
                <select
                  name="MaMauSac"
                  value={variant.MaMauSac}
                  onChange={(e) => handleEditVariantChange(index, e)}
                  required
                >
                  <option value="">Chọn màu</option>
                  {colors.map((item) => (
                    <option key={item.MaMauSac} value={item.MaMauSac}>
                      {item.TenMauSac}
                    </option>
                  ))}
                </select>

                <select
                  name="MaSize"
                  value={variant.MaSize}
                  onChange={(e) => handleEditVariantChange(index, e)}
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
                  name="SoLuong"
                  min="0"
                  placeholder="Số lượng"
                  value={variant.SoLuong}
                  onChange={(e) => handleEditVariantChange(index, e)}
                  required
                />
              </div>
            ))}

            <div className="variant-actions">
              <button type="submit" className="variant-save-btn">
                Lưu tồn kho
              </button>

              <button
                type="button"
                className="variant-cancel-btn"
                onClick={() => setShowVariantForm(false)}
              >
                Hủy
              </button>
            </div>
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
              <th>Giá gốc</th>
              <th>KM</th>
              <th>Giá sau giảm</th>
              <th>Mô tả</th>
              <th>Tổng SL</th>
              <th>Trạng thái</th>
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
                <td>{item.DanhSachMau}</td>
                <td>{item.DanhSachSize}</td>
                <td>{Number(item.DonGia).toLocaleString()}đ</td>
                <td>{item.KhuyenMai || 0}%</td>
                <td>
                  {calcDiscountPrice(
                    item.DonGia || 0,
                    item.KhuyenMai || 0,
                  ).toLocaleString()}
                  đ
                </td>
                <td>{item.MoTa}</td>
                <td>{item.TongSoLuong}</td>

                <td>
                  <span
                    className={
                      item.TrangThai === "DangBan"
                        ? "status-selling"
                        : "status-stopped"
                    }
                  >
                    {item.TrangThai === "DangBan" ? "Đang bán" : "Ngưng bán"}
                  </span>
                </td>

                <td>
                  <div className="action-group">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(item)}
                    >
                      Sửa SP
                    </button>

                    <button
                      className="btn-variant"
                      onClick={() => handleEditVariantClick(item)}
                    >
                      Biến thể
                    </button>

                    {item.TrangThai === "DangBan" ? (
                      <button
                        className="btn-hide"
                        onClick={() => handleHideProduct(item.MaSanPham)}
                      >
                        Ẩn
                      </button>
                    ) : (
                      <button
                        className="btn-show"
                        onClick={() => handleShowProduct(item.MaSanPham)}
                      >
                        Hiện
                      </button>
                    )}
                  </div>
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
