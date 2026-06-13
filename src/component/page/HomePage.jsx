import Header from "../header/Header";
import bannerShoe from "../asset/banner/banner-hong.jpg";
import "../asset/HomePage.css";
import HomeProduct from "./HomeProduct";

function HomePage() {
  return (
    <>
      <Header />

      <section className="home-hero">
        <img
          src={bannerShoe}
          alt="Banner"
          className="hero-banner"
        />

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="hero-badge">
            NEW COLLECTION 2026
          </span>

          <h1>
            FIND YOUR
            <br />
            PERFECT <span>SHOES</span>
          </h1>

          <p>
            Khám phá những mẫu sneaker thời trang, giày thể thao và
            running mới nhất.
          </p>

          <div className="hero-buttons">
            <button className="hero-btn-primary">
              Mua ngay
            </button>

            <button className="hero-btn-secondary">
              Xem sản phẩm
            </button>
          </div>
        </div>
      </section>

      <HomeProduct />
    </>
  );
}

export default HomePage;