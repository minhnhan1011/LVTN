import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../asset/CheckoutPage.css";

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const [info, setInfo] = useState({
    HoTen: "",
    SoDienThoai: "",
    ThanhPho: "",
    Quan: "",
    Phuong: "",
    DiaChiChiTiet: "",
    PhuongThucThanhToan: "COD",
  });

  const addressData = {
    "TP. Hồ Chí Minh": {
      "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho"],
      "Quận 3": ["Phường 1", "Phường 2", "Phường 3"],
      "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Phú Mỹ"],
      "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3"],
    },
    "Hà Nội": {
      "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch"],
      "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Bài"],
      "Quận Đống Đa": ["Phường Cát Linh", "Phường Văn Miếu"],
    },
    "Đà Nẵng": {
      "Quận Hải Châu": ["Phường Hải Châu 1", "Phường Hải Châu 2"],
      "Quận Thanh Khê": ["Phường Tam Thuận", "Phường Thạc Gián"],
    },
  };

  useEffect(() => {
    const data = localStorage.getItem("checkoutItems");

    if (!data) {
      setCart([]);
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setCart(Array.isArray(parsedData) ? parsedData : []);
    } catch (err) {
      console.log("Lỗi đọc checkoutItems:", err);
      setCart([]);
    }
  }, []);

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.DonGia) * Number(item.SoLuong);
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ThanhPho") {
      setInfo({
        ...info,
        ThanhPho: value,
        Quan: "",
        Phuong: "",
      });
      return;
    }

    if (name === "Quan") {
      setInfo({
        ...info,
        Quan: value,
        Phuong: "",
      });
      return;
    }

    setInfo({
      ...info,
      [name]: value,
    });
  };

  const handleOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Không có sản phẩm để thanh toán");
      return;
    }

    if (
      !info.HoTen ||
      !info.SoDienThoai ||
      !info.ThanhPho ||
      !info.Quan ||
      !info.Phuong ||
      !info.DiaChiChiTiet
    ) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    const MaNguoiDung = localStorage.getItem("MaNguoiDung");

    if (!MaNguoiDung) {
      alert("Bạn cần đăng nhập để đặt hàng");
      return;
    }

    try {
      await axios.post("http://localhost:5000/checkout", {
        MaNguoiDung,
        ...info,
        items: cart,
        TongTien: total,
      });

      localStorage.removeItem("checkoutItems");

      alert("Đặt hàng thành công");
      navigate("/orderpage");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  return (
    <>
      <Header />

      <main className="checkout-page">
        <h1>Thanh toán</h1>

        {cart.length === 0 ? (
          <div className="empty-checkout">
            Không có sản phẩm nào được chọn để thanh toán
          </div>
        ) : (
          <form className="checkout-layout" onSubmit={handleOrder}>
            <section className="checkout-form">
              <h2>Thông tin giao hàng</h2>

              <input
                type="text"
                name="HoTen"
                placeholder="Họ tên người nhận"
                value={info.HoTen}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="SoDienThoai"
                placeholder="Số điện thoại"
                value={info.SoDienThoai}
                onChange={handleChange}
                required
              />

              <select
                name="ThanhPho"
                value={info.ThanhPho}
                onChange={handleChange}
                required
              >
                <option value="">Chọn thành phố</option>
                {Object.keys(addressData).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                name="Quan"
                value={info.Quan}
                onChange={handleChange}
                required
                disabled={!info.ThanhPho}
              >
                <option value="">Chọn quận</option>
                {info.ThanhPho &&
                  Object.keys(addressData[info.ThanhPho]).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </select>

              <select
                name="Phuong"
                value={info.Phuong}
                onChange={handleChange}
                required
                disabled={!info.Quan}
              >
                <option value="">Chọn phường</option>
                {info.ThanhPho &&
                  info.Quan &&
                  addressData[info.ThanhPho][info.Quan].map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
              </select>

              <textarea
                name="DiaChiChiTiet"
                placeholder="Số nhà, tên đường..."
                value={info.DiaChiChiTiet}
                onChange={handleChange}
                required
              />

              <h2>Phương thức thanh toán</h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="PhuongThucThanhToan"
                  value="COD"
                  checked={info.PhuongThucThanhToan === "COD"}
                  onChange={handleChange}
                />
                Thanh toán khi nhận hàng
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="PhuongThucThanhToan"
                  value="BANK"
                  checked={info.PhuongThucThanhToan === "BANK"}
                  onChange={handleChange}
                />
                Chuyển khoản ngân hàng
              </label>
            </section>

            <aside className="checkout-summary">
              <h2>Đơn hàng</h2>

              {cart.map((item) => (
                <div className="checkout-item" key={item.MaGioHangChiTiet}>
                  <img
                    src={
                      item.DuongDan
                        ? `http://localhost:5000${item.DuongDan}`
                        : "/no-image.png"
                    }
                    alt={item.TenSanPham}
                  />

                  <div>
                    <h3>{item.TenSanPham}</h3>
                    <p>
                      {item.TenMauSac} / Size {item.TenSize}
                    </p>
                    <p>Số lượng: {item.SoLuong}</p>
                  </div>

                  <strong>
                    {(
                      Number(item.DonGia) * Number(item.SoLuong)
                    ).toLocaleString()}
                    đ
                  </strong>
                </div>
              ))}

              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{total.toLocaleString()}đ</strong>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </div>

              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{total.toLocaleString()}đ</strong>
              </div>

              <button type="submit" className="order-btn">
                Thanh toán
              </button>
            </aside>
          </form>
        )}
      </main>
    </>
  );
}

export default CheckoutPage;