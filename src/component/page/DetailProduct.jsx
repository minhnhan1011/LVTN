import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../asset/DetailProduct.css";
import Footer from "../footer/Footer";

function DetailProduct() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/product/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  if (!product) {
    return <h2>Đang tải...</h2>;
  }

  const uniqueColors = [
    ...new Set(product.variants?.map((v) => v.TenMauSac)),
  ];

  const uniqueSizes = [
    ...new Set(product.variants?.map((v) => v.TenSize)),
  ];

  return (
    <>
      <Header />

      <main className="detail-page">
        <div className="detail-container">

          <div className="detail-image">
            <img
              src={`http://localhost:5000${product.DuongDan}`}
              alt={product.TenSanPham}
            />
          </div>

          <div className="detail-info">
            <h1>{product.TenSanPham}</h1>

            <p className="detail-price">
              {Number(product.DonGia).toLocaleString()}đ
            </p>

            <p className="detail-brand">
              {product.TenThuongHieu}
            </p>

            <p className="detail-type">
              {product.TenLoaiSanPham}
            </p>

            <div className="detail-option">
              <h3>Màu sắc</h3>

              <div className="option-list">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    className={
                      selectedColor === color ? "active" : ""
                    }
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-option">
              <h3>Size</h3>

              <div className="option-list">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    className={
                      selectedSize === size ? "active" : ""
                    }
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-description">
              <h3>Mô tả sản phẩm</h3>

              <p>{product.MoTa}</p>
            </div>

            <button className="add-cart-btn">
              Thêm vào giỏ hàng
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default DetailProduct;