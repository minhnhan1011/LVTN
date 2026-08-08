import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../asset/HomeProduct.css";

function HomeProduct() {
  const [newProducts, setNewProducts] = useState([]);
  const [nikeProducts, setNikeProducts] = useState([]);
  const [adidasProducts, setAdidasProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/home/new-products")
      .then((res) => setNewProducts(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/home/nike-products")
      .then((res) => setNikeProducts(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/home/adidas-products")
      .then((res) => setAdidasProducts(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:5000/home/promo-products")
      .then((res) => setPromoProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const calcDiscountPrice = (price, discount, loaiGiamGia) => {
    const gia = Number(price);
    const giam = Number(discount || 0);

    if (loaiGiamGia === "PhanTram") {
      return gia - (gia * giam) / 100;
    }

    if (loaiGiamGia === "SoTien") {
      return Math.max(gia - giam, 0);
    }
    return gia;
  };

  const renderCard = (item) => {
    const finalPrice = calcDiscountPrice(
      item.DonGia || 0,
      item.KhuyenMai || 0,
      item.LoaiGiamGia,
    );

    return (
      <Link
        key={item.MaSanPham}
        to={`/detailproduct/${item.MaSanPham}`}
        className="home-product-card"
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

          {Number(item.KhuyenMai) > 0 && (
            <span className="home-discount-badge">
              {item.LoaiGiamGia === "PhanTram"
                ? `-${Number(item.KhuyenMai)}%`
                : `-${Number(item.KhuyenMai).toLocaleString("vi-VN")}đ`}
            </span>
          )}
        </div>

        <div className="home-product-info">
          <h3>{item.TenSanPham}</h3>
          <p>{item.TenThuongHieu}</p>

          {Number(item.KhuyenMai) > 0 ? (
            <div className="home-price-box">
              <span className="home-old-price">
                {Number(item.DonGia).toLocaleString()}đ
              </span>

              <strong className="home-sale-price">
                {finalPrice.toLocaleString()}đ
              </strong>
            </div>
          ) : (
            <strong className="home-sale-price">
              {Number(item.DonGia).toLocaleString()}đ
            </strong>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      <section className="home-products">
        <div className="home-products-header">
          <span>SẢN PHẨM MỚI</span>
          <h2>Giày mới nhất</h2>
        </div>

        <div className="home-product-grid">{newProducts.map(renderCard)}</div>
      </section>

      <section className="home-products">
        <div className="home-products-header row">
          <div>
            <span>NIKE COLLECTION</span>
            <h2>Nike mới nhất</h2>
          </div>

          <Link to="/productpage?brand=Nike" className="view-more-btn">
            Xem thêm
          </Link>
        </div>

        <div className="home-product-scroll">
          {nikeProducts.map(renderCard)}
        </div>
      </section>

      <section className="home-products">
        <div className="home-products-header row">
          <div>
            <span>ADIDAS COLLECTION</span>
            <h2>Adidas mới nhất</h2>
          </div>

          <Link to="/productpage?brand=Adidas" className="view-more-btn">
            Xem thêm
          </Link>
        </div>

        <div className="home-product-scroll">
          {adidasProducts.map(renderCard)}
        </div>
      </section>

      <section className="home-products">
        <div className="home-products-header row">
          <div>
            <span>Khuyến mãi</span>
            <h2>Sản phẩm khuyến mãi</h2>
          </div>

          <Link to="/productpage?promo=true" className="view-more-btn">
            Xem thêm
          </Link>
        </div>

        <div className="home-product-scroll">
          {promoProducts.map(renderCard)}
        </div>
      </section>
    </>
  );
}

export default HomeProduct;
