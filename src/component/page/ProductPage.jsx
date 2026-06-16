import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import { Link } from "react-router-dom";
import "../asset/ProductPage.css";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [filters, setFilters] = useState({
    price: "",
    type: "",
    brand: "",
    size: "",
    color: "",
  });

  useEffect(() => {
    axios.get("http://localhost:5000/admin/products")
      .then((res) => setProducts(res.data));

    axios.get("http://localhost:5000/admin/product-types")
      .then((res) => setProductTypes(res.data));

    axios.get("http://localhost:5000/admin/brands")
      .then((res) => setBrands(res.data));

    axios.get("http://localhost:5000/admin/colors")
      .then((res) => setColors(res.data));

    axios.get("http://localhost:5000/admin/sizes")
      .then((res) => setSizes(res.data));
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredProducts = products.filter((item) => {
    const matchType =
      filters.type === "" || item.TenLoaiSanPham === filters.type;

    const matchBrand =
      filters.brand === "" || item.TenThuongHieu === filters.brand;

    const matchSize =
      filters.size === "" || item.TenSize === filters.size;

    const matchColor =
      filters.color === "" || item.TenMauSac === filters.color;

    let matchPrice = true;

    if (filters.price === "under500") {
      matchPrice = Number(item.DonGia) < 500000;
    } else if (filters.price === "500to1000") {
      matchPrice =
        Number(item.DonGia) >= 500000 && Number(item.DonGia) <= 1000000;
    } else if (filters.price === "above1000") {
      matchPrice = Number(item.DonGia) > 1000000;
    }

    return matchType && matchBrand && matchSize && matchColor && matchPrice;
  });

  return (
    <>
      <Header />

      <main className="product-page">
        <aside className="product-filter">
          <h2>Bộ lọc</h2>

          <div className="filter-group">
            <label>Giá tiền</label>
            <select name="price" value={filters.price} onChange={handleFilterChange}>
              <option value="">Tất cả giá</option>
              <option value="under500">Dưới 500.000đ</option>
              <option value="500to1000">500.000đ - 1.000.000đ</option>
              <option value="above1000">Trên 1.000.000đ</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Loại sản phẩm</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">Tất cả loại</option>
              {productTypes.map((item) => (
                <option key={item.MaLoaiSanPham} value={item.TenLoaiSanPham}>
                  {item.TenLoaiSanPham}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Thương hiệu</label>
            <select name="brand" value={filters.brand} onChange={handleFilterChange}>
              <option value="">Tất cả thương hiệu</option>
              {brands.map((item) => (
                <option key={item.MaThuongHieu} value={item.TenThuongHieu}>
                  {item.TenThuongHieu}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Size</label>
            <select name="size" value={filters.size} onChange={handleFilterChange}>
              <option value="">Tất cả size</option>
              {sizes.map((item) => (
                <option key={item.MaSize} value={item.TenSize}>
                  {item.TenSize}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Màu sắc</label>
            <select name="color" value={filters.color} onChange={handleFilterChange}>
              <option value="">Tất cả màu</option>
              {colors.map((item) => (
                <option key={item.MaMauSac} value={item.TenMauSac}>
                  {item.TenMauSac}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filter-btn"
            onClick={() =>
              setFilters({
                price: "",
                type: "",
                brand: "",
                size: "",
                color: "",
              })
            }
          >
            Xóa lọc
          </button>
        </aside>

        <section className="product-list-section">
          <div className="product-page-title">
            <h1>Tất cả sản phẩm</h1>
            <p>{filteredProducts.length} sản phẩm</p>
          </div>

          <div className="product-grid">
            {filteredProducts.map((item) => (
              <div className="product-card" key={item.MaSanPham}>
                <img
                  src={`http://localhost:5000${item.DuongDan}`}
                  alt={item.TenSanPham}
                />

                <div className="product-info">
                  <h3>{item.TenSanPham}</h3>
                  <p>{item.TenThuongHieu}</p>
                  <p>Size: {item.TenSize}</p>
                  <p>Màu: {item.TenMauSac}</p>

                  <strong>{Number(item.DonGia).toLocaleString()}đ</strong>
                  
                  <Link to={`/detailproduct/${item.MaSanPham}`}>
                    <button>Xem chi tiết</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default ProductPage;