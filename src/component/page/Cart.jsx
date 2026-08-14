import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../asset/Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const MaNguoiDung = localStorage.getItem("MaNguoiDung");

  const getCartItemId = (item) => {
    return item.MaGioHangChiTiet || item.MaBienThe;
  };

  const fetchCart = () => {
    if (!MaNguoiDung) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

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
      .catch((err) => {
        console.log(err.response?.data || err);
      });
  };

  useEffect(() => {
    fetchCart();
  }, [MaNguoiDung]);

  const handleCheckItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleCheckAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => getCartItemId(item)));
    }
  };

  const updateGuestCart = (newCart) => {
    localStorage.setItem("guestCart", JSON.stringify(newCart));

    setCart(newCart);
  };

  const handleQuantity = async (item, type) => {
    let newQuantity = Number(item.SoLuong);

    const stock = Number(item.SoLuongTonKho ?? item.SoLuongKho ?? 0);

    if (type === "minus") {
      if (newQuantity <= 1) {
        return;
      }

      newQuantity -= 1;
    }

    if (type === "plus") {
      if (stock <= 0) {
        alert("Sản phẩm hiện đã hết hàng");
        return;
      }

      if (newQuantity + 1 > stock) {
        alert(`Trong kho chỉ còn ${stock} sản phẩm`);
        return;
      }

      newQuantity += 1;
    }

    if (!MaNguoiDung) {
      const newCart = cart.map((cartItem) =>
        cartItem.MaBienThe === item.MaBienThe
          ? {
              ...cartItem,
              SoLuong: newQuantity,
            }
          : cartItem,
      );

      updateGuestCart(newCart);
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/cart/detail/${item.MaGioHangChiTiet}`,
        {
          SoLuong: newQuantity,
        },
      );

      fetchCart();
    } catch (err) {
      console.log(err.response?.data || err);

      alert(err.response?.data?.message || "Cập nhật số lượng thất bại");
    }
  };

  const handleDeleteCartItem = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
    );

    if (!confirmDelete) {
      return;
    }

    if (!MaNguoiDung) {
      const newCart = cart.filter((item) => getCartItemId(item) !== id);

      updateGuestCart(newCart);

      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));

      alert("Đã xóa khỏi giỏ hàng");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/cart/detail/${id}`);

      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));

      fetchCart();

      alert("Đã xóa khỏi giỏ hàng");
    } catch (err) {
      console.log(err.response?.data || err);

      alert(err.response?.data?.message || "Xóa sản phẩm thất bại");
    }
  };

  const selectedCart = cart.filter((item) =>
    selectedItems.includes(getCartItemId(item)),
  );

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

  const total = selectedCart.reduce((sum, item) => {
    const finalPrice = calcDiscountPrice(
      item.DonGiaGoc,
      item.KhuyenMai,
      item.LoaiGiamGia,
    );
    return sum + finalPrice * Number(item.SoLuong);
  }, 0);

  const handleCheckout = () => {
    // Kiểm tra người dùng đã chọn sản phẩm chưa
    if (selectedCart.length === 0) {
      alert("Vui lòng chọn sản phẩm cần mua");
      return;
    }

    // Kiểm tra tồn kho
    for (const item of selectedCart) {
      const stock = Number(item.SoLuongTonKho ?? item.SoLuongKho ?? 0);

      if (stock <= 0) {
        alert(`${item.TenSanPham} hiện đã hết hàng`);
        return;
      }

      if (Number(item.SoLuong) > stock) {
        alert(
          `${item.TenSanPham} chỉ còn ${stock} sản phẩm trong kho. Vui lòng giảm số lượng.`,
        );
        return;
      }
    }

    if (discount <= 0) {
      localStorage.removeItem("appliedPromo");
    }

    // Lưu sản phẩm người dùng đã chọn
    localStorage.setItem("checkoutItems", JSON.stringify(selectedCart));

    const currentUserId = localStorage.getItem("MaNguoiDung");

    // Chưa đăng nhập thì chuyển sang login
    if (!currentUserId) {
      navigate("/login", {
        state: {
          redirectTo: "/cart",
        },
      });

      return;
    }

    // Đã đăng nhập thì sang checkout
    navigate("/checkout");
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
  };

  const handleApplyPromo = async () => {
    try {
      const res = await axios.post("http://localhost:5000/check-promo", {
        MaKhuyenMai: promoCode,
      });

      const promo = res.data;

      let discount = 0;

      if (promo.LoaiGiamGia === "PhanTram") {
        discount = (total * Number(promo.GiaTriGiam)) / 100;
      } else if (promo.LoaiGiamGia === "SoTien") {
        discount = Number(promo.GiaTriGiam);
      }

      const finalDiscount = Math.min(discount, total);
      setDiscount(finalDiscount);
      localStorage.setItem("appliedPromo", JSON.stringify(promo));

      alert(`Áp dụng mã khuyến mãi thành công.`);
    } catch (err) {
      setDiscount(0);
      localStorage.removeItem("appliedPromo");

      alert(err.response?.data?.message || "Mã khuyến mãi không hợp lệ");
    }
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

              {cart.map((item) => {
                const itemId = getCartItemId(item);

                return (
                  <div className="cart-item" key={itemId}>
                    <input
                      type="checkbox"
                      className="cart-checkbox"
                      checked={selectedItems.includes(itemId)}
                      onChange={() => handleCheckItem(itemId)}
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

                      {(item.SoLuongTonKho !== undefined ||
                        item.SoLuongKho !== undefined) && (
                        <p>
                          Còn lại: {item.SoLuongTonKho ?? item.SoLuongKho} sản
                          phẩm
                        </p>
                      )}

                      {Number(item.KhuyenMai) > 0 && (
                        <p className="cart-sale-text">
                          Giảm{" "}
                          {item.LoaiGiamGia === "PhanTram"
                            ? `${item.KhuyenMai}%`
                            : `${Number(item.KhuyenMai).toLocaleString()}đ`}
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
                        onClick={() => handleDeleteCartItem(itemId)}
                      >
                        Xóa
                      </button>
                    </div>

                    <strong>
                      {(
                        calcDiscountPrice(
                          item.DonGiaGoc,
                          item.KhuyenMai,
                          item.LoaiGiamGia,
                        ) * Number(item.SoLuong)
                      ).toLocaleString()}
                      đ
                    </strong>
                  </div>
                );
              })}
            </section>

            <aside className="checkout-box">
              <h2>Thanh toán</h2>

              <div className="checkout-row">
                <span>Sản phẩm đã chọn</span>

                <strong>{selectedCart.length}</strong>
              </div>

              <div className="checkout-row">
                <span>Tạm tính</span>

                <strong>
                  {Math.max(total - discount, 0).toLocaleString()}đ
                </strong>
              </div>

              <div className="checkout-row">
                <span>Phí vận chuyển</span>

                <strong>Miễn phí</strong>
              </div>

              <div className="promo-code">
                <input
                  type="text"
                  placeholder="Mã khuyến mãi"
                  value={promoCode}
                  onChange={handlePromoCodeChange}
                />
                <button className="apply-promo-btn" onClick={handleApplyPromo}>
                  Áp dụng
                </button>
              </div>

              <div className="checkout-total">
                <span>Tổng cộng</span>

                <strong>
                  {Math.max(total - discount, 0).toLocaleString()}đ
                </strong>
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
