import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import "../asset/Cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const MaNguoiDung = localStorage.getItem("MaNguoiDung");

  const fetchCart = () => {
    if (!MaNguoiDung) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      setCart(guestCart);
      setSelectedItems([]);
      return;
    }

    axios
      .get(`http://localhost:5000/cart/${MaNguoiDung}`)
      .then((res) => {
        setCart(res.data);
        setSelectedItems([]);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchCart();
  }, [MaNguoiDung]);

  const handleCheckItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleCheckAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.MaGioHangChiTiet));
    }
  };

  const updateGuestCart = (newCart) => {
    localStorage.setItem("guestCart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const handleQuantity = async (item, type) => {
    let newQuantity = Number(item.SoLuong);

    if (type === "minus") {
      if (newQuantity <= 1) return;
      newQuantity -= 1;
    }

    if (type === "plus") {
      newQuantity += 1;
    }

    if (!MaNguoiDung) {
      const newCart = cart.map((cartItem) =>
        cartItem.MaGioHangChiTiet === item.MaGioHangChiTiet
          ? { ...cartItem, SoLuong: newQuantity }
          : cartItem
      );

      updateGuestCart(newCart);
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/cart/detail/${item.MaGioHangChiTiet}`,
        {
          SoLuong: newQuantity,
        }
      );

      fetchCart();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Cập nhật số lượng thất bại");
    }
  };

  const handleDeleteCartItem = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return;
    }

    if (!MaNguoiDung) {
      const newCart = cart.filter((item) => item.MaGioHangChiTiet !== id);

      updateGuestCart(newCart);
      setSelectedItems(selectedItems.filter((item) => item !== id));

      alert("Đã xóa khỏi giỏ hàng");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/cart/detail/${id}`);

      setSelectedItems(selectedItems.filter((item) => item !== id));
      fetchCart();

      alert("Đã xóa khỏi giỏ hàng");
    } catch (err) {
      console.log(err.response?.data || err);
      alert(err.response?.data?.message || "Xóa sản phẩm thất bại");
    }
  };

  const selectedCart = cart.filter((item) =>
    selectedItems.includes(item.MaGioHangChiTiet)
  );

  const total = selectedCart.reduce((sum, item) => {
    return sum + Number(item.DonGia) * Number(item.SoLuong);
  }, 0);

  const handleCheckout = () => {
    if (selectedCart.length === 0) {
      alert("Vui lòng chọn sản phẩm cần mua");
      return;
    }

    localStorage.setItem("checkoutItems", JSON.stringify(selectedCart));
    window.location.href = "/checkout";
  };

  return (
    <>
      <Header />

      <main className="cart-page">
        <h1>Giỏ hàng của bạn</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">Giỏ hàng đang trống</div>
        ) : (
          <div className="cart-layout">
            <section className="cart-list">
              <div className="cart-check-all">
                <label>
                  <input
                    type="checkbox"
                    checked={
                      cart.length > 0 && selectedItems.length === cart.length
                    }
                    onChange={handleCheckAll}
                  />
                  Chọn tất cả
                </label>
              </div>

              {cart.map((item) => (
                <div className="cart-item" key={item.MaGioHangChiTiet}>
                  <input
                    type="checkbox"
                    className="cart-checkbox"
                    checked={selectedItems.includes(item.MaGioHangChiTiet)}
                    onChange={() => handleCheckItem(item.MaGioHangChiTiet)}
                  />

                  <img
                    src={
                      item.DuongDan
                        ? `http://localhost:5000${item.DuongDan}`
                        : "/no-image.png"
                    }
                    alt={item.TenSanPham}
                  />

                  <div className="cart-info">
                    <h3>{item.TenSanPham}</h3>
                    <p>Màu: {item.TenMauSac}</p>
                    <p>Size: {item.TenSize}</p>

                    {Number(item.KhuyenMai) > 0 && (
                      <p className="cart-sale-text">
                        Giảm {item.KhuyenMai}%
                      </p>
                    )}

                    <div className="cart-qty">
                      <button
                        type="button"
                        onClick={() => handleQuantity(item, "minus")}
                      >
                        -
                      </button>

                      <span>{item.SoLuong}</span>

                      <button
                        type="button"
                        onClick={() => handleQuantity(item, "plus")}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-delete-btn"
                      onClick={() =>
                        handleDeleteCartItem(item.MaGioHangChiTiet)
                      }
                    >
                      Xóa
                    </button>
                  </div>

                  <strong>
                    {(
                      Number(item.DonGia) * Number(item.SoLuong)
                    ).toLocaleString()}
                    đ
                  </strong>
                </div>
              ))}
            </section>

            <aside className="checkout-box">
              <h2>Thanh toán</h2>

              <div className="checkout-row">
                <span>Sản phẩm đã chọn</span>
                <strong>{selectedCart.length}</strong>
              </div>

              <div className="checkout-row">
                <span>Tạm tính</span>
                <strong>{total.toLocaleString()}đ</strong>
              </div>

              <div className="checkout-row">
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </div>

              <div className="checkout-total">
                <span>Tổng cộng</span>
                <strong>{total.toLocaleString()}đ</strong>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Tiến hành đặt hàng
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Cart;