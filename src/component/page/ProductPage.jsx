import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import "../asset/ProductPage.css";

function ProductPage() {
  const [searchParams] = useSearchParams();

  const searchKeyword = searchParams.get("search") || "";
  const brandFromUrl = searchParams.get("brand") || "";

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
    axios
      .get("http://localhost:5000/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/admin/product-types")
      .then((res) => setProductTypes(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/admin/brands")
      .then((res) => setBrands(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/admin/colors")
      .then((res) => setColors(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/admin/sizes")
      .then((res) => setSizes(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (brandFromUrl) {
      setFilters((prev) => ({
        ...prev,
        brand: brandFromUrl,
      }));
    }
  }, [brandFromUrl]);

  const calcDiscountPrice = (price, discount) => {
    return Number(price) - (Number(price) * Number(discount || 0)) / 100;
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      price: "",
      type: "",
      brand: "",
      size: "",
      color: "",
    });
  };

  const filteredProducts = products.filter((item) => {
    const productName = item.TenSanPham || "";
    const finalPrice = calcDiscountPrice(item.DonGia || 0, item.KhuyenMai || 0);

    const matchSearch =
      searchKeyword === "" ||
      productName.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchType =
      filters.type === "" || item.TenLoaiSanPham === filters.type;

    const matchBrand =
      filters.brand === "" || item.TenThuongHieu === filters.brand;

    const matchSize =
      filters.size === "" ||
      (item.DanhSachSize && item.DanhSachSize.includes(filters.size));

    const matchColor =
      filters.color === "" ||
      (item.DanhSachMau && item.DanhSachMau.includes(filters.color));

    let matchPrice = true;

    if (filters.price === "under500") {
      matchPrice = finalPrice < 500000;
    } else if (filters.price === "500to1000") {
      matchPrice = finalPrice >= 500000 && finalPrice <= 1000000;
    } else if (filters.price === "above1000") {
      matchPrice = finalPrice > 1000000;
    }

    return (
      matchSearch &&
      matchType &&
      matchBrand &&
      matchSize &&
      matchColor &&
      matchPrice
    );
  });

  return (
    <>
      <Header />

      <main className="product-page">
        <aside className="product-filter">
          <h2>Bộ lọc</h2>

          {searchKeyword && (
            <div className="search-result-box">
              Từ khóa: <strong>{searchKeyword}</strong>
            </div>
          )}

          <div className="filter-group">
            <label>Giá tiền</label>
            <select
              name="price"
              value={filters.price}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả giá</option>
              <option value="under500">Dưới 500.000đ</option>
              <option value="500to1000">500.000đ - 1.000.000đ</option>
              <option value="above1000">Trên 1.000.000đ</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Loại sản phẩm</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
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
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
            >
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
            <select
              name="size"
              value={filters.size}
              onChange={handleFilterChange}
            >
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
            <select
              name="color"
              value={filters.color}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả màu</option>
              {colors.map((item) => (
                <option key={item.MaMauSac} value={item.TenMauSac}>
                  {item.TenMauSac}
                </option>
              ))}
            </select>
          </div>

          <button className="clear-filter-btn" onClick={clearFilters}>
            Xóa lọc
          </button>
        </aside>

        <section className="product-list-section">
          <div className="product-page-title">
            <h1>
              {searchKeyword
                ? `Kết quả tìm kiếm: ${searchKeyword}`
                : filters.brand
                ? `Sản phẩm ${filters.brand}`
                : "Tất cả sản phẩm"}
            </h1>

            <p>{filteredProducts.length} sản phẩm</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-product">Không tìm thấy sản phẩm phù hợp</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((item) => {
                const finalPrice = calcDiscountPrice(
                  item.DonGia || 0,
                  item.KhuyenMai || 0
                );

                return (
                  <div className="product-card" key={item.MaSanPham}>
                    <img
                      src={
                        item.DuongDan
                          ? `http://localhost:5000${item.DuongDan}`
                          : "/no-image.png"
                      }
                      alt={item.TenSanPham}
                    />

                    <div className="product-info">
                      <h3>{item.TenSanPham}</h3>
                      <p>{item.TenThuongHieu}</p>
                      <p>Size: {item.DanhSachSize}</p>
                      <p>Màu: {item.DanhSachMau}</p>

                      {Number(item.KhuyenMai) > 0 ? (
                        <div className="price-box">
                          <span className="old-price">
                            {Number(item.DonGia).toLocaleString()}đ
                          </span>

                          <strong className="sale-price">
                            {finalPrice.toLocaleString()}đ
                          </strong>

                          <span className="discount-badge">
                            -{item.KhuyenMai}%
                          </span>
                        </div>
                      ) : (
                        <strong className="sale-price">
                          {Number(item.DonGia).toLocaleString()}đ
                        </strong>
                      )}

                      <Link to={`/detailproduct/${item.MaSanPham}`}>
                        <button>Xem chi tiết</button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default ProductPage;