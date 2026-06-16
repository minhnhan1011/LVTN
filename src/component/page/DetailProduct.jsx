import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../asset/DetailProduct.css";
import Footer from "../footer/Footer";

function DetailProduct() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get(`http://localhost:5000/product/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get("http://localhost:5000/auth", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "Success") {
          setUser(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  if (!product) {
    return <h2>Đang tải...</h2>;
  }

  const uniqueColors = [...new Set(product.variants?.map((v) => v.TenMauSac))];

  const uniqueSizes = [...new Set(product.variants?.map((v) => v.TenSize))];

  const selectedVariant = product.variants?.find(
    (item) => item.TenMauSac === selectedColor && item.TenSize === selectedSize
  );

  const handleAddCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }

    if (!selectedSize) {
      alert("Vui lòng chọn size");
      return;
    }

    if (!selectedVariant) {
      alert("sản phẩm không tồn tại");
      return;
    }

    if (quantity <= 0) {
      alert("Số lượng phải lớn hơn 0");
      return;
    }

    if (quantity > selectedVariant.SoLuong) {
      alert(`Chỉ còn ${selectedVariant.SoLuong} sản phẩm trong kho`);
      return;
    }

    try {
      await axios.post("http://localhost:5000/cart", {
        MaNguoiDung: user.MaNguoiDung,
        MaBienThe: selectedVariant.MaBienThe,
        SoLuong: quantity,
      });

      alert("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Thêm giỏ hàng thất bại");
    }
  };

  return (
    <>
      <Header />

      <main className="detail-page">
        <div className="detail-container">
          <div className="detail-image">
            <img
              src={
                product.DuongDan
                  ? `http://localhost:5000${product.DuongDan}`
                  : "/no-image.png"
              }
              alt={product.TenSanPham}
            />
          </div>

          <div className="detail-info">
            <h1>{product.TenSanPham}</h1>

            <p className="detail-price">
              {Number(product.DonGia).toLocaleString()}đ
            </p>

            <p className="detail-brand">{product.TenThuongHieu}</p>

            <p className="detail-type">{product.TenLoaiSanPham}</p>

            <div className="detail-option">
              <h3>Màu sắc</h3>

              <div className="option-list">
                {uniqueColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={selectedColor === color ? "active" : ""}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize("");
                      setQuantity(1);
                    }}
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
                    type="button"
                    key={size}
                    className={selectedSize === size ? "active" : ""}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
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

            <button className="add-cart-btn" onClick={handleAddCart}>
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