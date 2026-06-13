import React, { useEffect, useState } from "react";
import axios from "axios";
import "../asset/HomeProduct.css";

function HomeProduct() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <section className="home-products">
      <div className="home-products-header">
        <p>SẢN PHẨM MỚI</p>
        <h2>Giày mới nhất</h2>
      </div>

      <div className="home-product-list">
        {products.map((item) => (
          <div className="home-product-card" key={item.MaSanPham}>
            <div className="home-product-img">
              {item.DuongDan && (
                <img
                  src={`http://localhost:5000${item.DuongDan}`}
                  alt={item.TenSanPham}
                />
              )}
            </div>

            <div className="home-product-info">
              <h3>{item.TenSanPham}</h3>
              <p>{item.TenThuongHieu}</p>
              <p>{item.MoTa}</p>

              <div className="home-product-bottom">
                <span>{Number(item.DonGia).toLocaleString()}đ</span>
                <button>Xem</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeProduct;