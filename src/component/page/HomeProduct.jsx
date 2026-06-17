import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../asset/HomeProduct.css";

function HomeProduct() {
  const [newProducts, setNewProducts] = useState([]);
  const [nikeProducts, setNikeProducts] = useState([]);
  const [adidasProducts, setAdidasProducts] = useState([]);

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
  }, []);


  // render card san pham de qua trang chi tiet san pham
  const renderCard = (item) => (
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
      </div>

      <div className="home-product-info">
        <h3>{item.TenSanPham}</h3>
        <p>{item.TenThuongHieu}</p>
        <strong>{Number(item.DonGia).toLocaleString()}đ</strong>
      </div>
    </Link>
  );

  return (
    <>
      <section className="home-products">
        <div className="home-products-header">
          <span>SẢN PHẨM MỚI</span>
          <h2>Giày mới nhất</h2>
        </div>

        <div className="home-product-grid">
          {newProducts.map(renderCard)}
        </div>
      </section>

      <section className="home-products">
        <div className="home-products-header row">
          <div>
            <span>NIKE COLLECTION</span>
            <h2>Nike mới nhất</h2>
          </div>

          {/* truyen thuong hieu de loc san pham qua trang productpage */}
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
    </>
  );
}

export default HomeProduct;