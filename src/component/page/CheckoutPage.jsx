import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import "../asset/CheckoutPage.css";

function CheckoutPage() {
  const [cart, setCart] = useState([]);

  const [info, setInfo] = useState({
    HoTen: "",
    SoDienThoai: "",
    DiaChi: "",
    PhuongThucThanhToan: "COD",
  });

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
    setInfo({
      ...info,
      [e.target.name]: e.target.value,
    });
  };

  const handleOrder = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Không có sản phẩm để thanh toán");
      return;
    }

    if (!info.HoTen || !info.SoDienThoai || !info.DiaChi) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    alert("Đặt hàng thành công");
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

              <textarea
                name="DiaChi"
                placeholder="Địa chỉ giao hàng"
                value={info.DiaChi}
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
                    {(Number(item.DonGia) * Number(item.SoLuong)).toLocaleString()}đ
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