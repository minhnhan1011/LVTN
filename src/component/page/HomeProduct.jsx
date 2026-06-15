import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../asset/HomeProduct.css";

function HomeProduct() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/products"
      );

      setProducts(res.data.slice(0, 8));
    } catch (err) {
      console.log("Lỗi lấy sản phẩm:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="home-products">
      <div className="home-products-header">
        <span>SẢN PHẨM MỚI</span>
        <h2>Giày mới nhất</h2>
      </div>

      <div className="home-product-list">
        {products.map((item) => (
          <Link
            to={`/detailproduct/${item.MaSanPham}`}
            className="home-product-card"
            key={item.MaSanPham}
          >
            <div className="home-product-img">
              <img
                src={
                  item.DuongDan
                    ? `http://localhost:5000${item.DuongDan}`
                    : "/no-image.png"
                }
                alt={item.TenSanPham}
              />
            </div>

            <div className="home-product-info">
              <h3>{item.TenSanPham}</h3>

              <p className="brand">
                {item.TenThuongHieu}
              </p>

              <div className="home-product-bottom">
                <span>
                  {Number(item.DonGia).toLocaleString()}đ
                </span>

                <button type="button">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeProduct;