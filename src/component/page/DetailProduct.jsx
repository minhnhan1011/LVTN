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

  // State bình luận
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  axios.defaults.withCredentials = true;

  // Lấy danh sách bình luận theo sản phẩm
  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/comments/${id}`);

      setComments(res.data);
    } catch (err) {
      console.log("Lỗi lấy bình luận:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    // Lấy thông tin sản phẩm
    axios
      .get(`http://localhost:5000/product/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.log("Lỗi lấy sản phẩm:", err);
      });

    // Kiểm tra đăng nhập
    axios
      .get("http://localhost:5000/auth", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status === "Success") {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.log("Lỗi xác thực:", err);
        setUser(null);
      });

    // Lấy bình luận
    fetchComments();
  }, [id]);

  if (!product) {
    return <h2>Đang tải...</h2>;
  }

  const calcDiscountPrice = (price, discount) => {
    return Number(price) - (Number(price) * Number(discount || 0)) / 100;
  };

  const uniqueColors = [
    ...new Set(product.variants?.map((variant) => variant.TenMauSac)),
  ];

  const uniqueSizes = [
    ...new Set(product.variants?.map((variant) => variant.TenSize)),
  ];

  const selectedVariant = product.variants?.find(
    (item) => item.TenMauSac === selectedColor && item.TenSize === selectedSize,
  );

  const finalPrice = calcDiscountPrice(product.DonGia, product.KhuyenMai);

  const handleAddCart = async () => {
    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }

    if (!selectedSize) {
      alert("Vui lòng chọn size");
      return;
    }

    if (!selectedVariant) {
      alert("Sản phẩm không tồn tại");
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

    // Khách chưa đăng nhập
    if (!user) {
      const guestCartItem = {
        MaGioHangChiTiet: `guest-${selectedVariant.MaBienThe}`,
        MaBienThe: selectedVariant.MaBienThe,
        MaSanPham: product.MaSanPham,
        TenSanPham: product.TenSanPham,
        TenMauSac: selectedColor,
        TenSize: selectedSize,
        SoLuong: quantity,
        DonGia: finalPrice,
        DonGiaGoc: product.DonGia,
        KhuyenMai: product.KhuyenMai || 0,
        DuongDan: product.DuongDan,
      };

      const oldCart = JSON.parse(localStorage.getItem("guestCart")) || [];

      const existedItem = oldCart.find(
        (item) => item.MaBienThe === selectedVariant.MaBienThe,
      );

      let newCart;

      if (existedItem) {
        const newQuantity = Number(existedItem.SoLuong) + Number(quantity);

        if (newQuantity > selectedVariant.SoLuong) {
          alert(
            `Tổng số lượng trong giỏ không được vượt quá ${selectedVariant.SoLuong}`,
          );
          return;
        }

        newCart = oldCart.map((item) =>
          item.MaBienThe === selectedVariant.MaBienThe
            ? {
                ...item,
                SoLuong: newQuantity,
              }
            : item,
        );
      } else {
        newCart = [...oldCart, guestCartItem];
      }

      localStorage.setItem("guestCart", JSON.stringify(newCart));

      alert("Đã thêm vào giỏ hàng");
      return;
    }

    // Khách đã đăng nhập
    try {
      await axios.post("http://localhost:5000/cart", {
        MaNguoiDung: user.MaNguoiDung,
        MaBienThe: selectedVariant.MaBienThe,
        SoLuong: quantity,
      });

      alert("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.log("Lỗi thêm giỏ hàng:", err);

      alert(err.response?.data?.message || "Thêm giỏ hàng thất bại");
    }
  };

  // Gửi bình luận
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!commentContent.trim()) {
      alert("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (commentContent.trim().length > 500) {
      alert("Bình luận không được vượt quá 500 ký tự");
      return;
    }

    try {
      setCommentLoading(true);

      await axios.post("http://localhost:5000/comments", {
        MaSanPham: product.MaSanPham,
        MaNguoiDung: user.MaNguoiDung,
        NoiDung: commentContent.trim(),
        MaBinhLuanGoc: null,
      });

      setCommentContent("");

      // Lấy lại danh sách sau khi thêm
      await fetchComments();
    } catch (err) {
      console.log("Lỗi gửi bình luận:", err);

      alert(err.response?.data?.message || "Không thể gửi bình luận");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (MaBinhLuan) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa bình luận này không?",
    );
    if (!confirmDelete) {
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/comments/${MaBinhLuan}`, {
        MaNguoiDung: user.MaNguoiDung,
      });

      alert("Đã xóa bình luận");

      await fetchComments();
    } catch (err) {
      console.log("Lỗi xóa bình luận:", err);

      alert(err.response?.data?.message || "Xóa bình luận thất bại");
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

            {Number(product.KhuyenMai) > 0 ? (
              <div className="detail-price-box">
                <span className="detail-old-price">
                  {Number(product.DonGia).toLocaleString()}đ
                </span>

                <p className="detail-price">{finalPrice.toLocaleString()}đ</p>

                <span className="detail-discount-badge">
                  -{product.KhuyenMai}%
                </span>
              </div>
            ) : (
              <p className="detail-price">
                {Number(product.DonGia).toLocaleString()}đ
              </p>
            )}

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

            <div className="detail-option">
              <h3>Số lượng</h3>

              <div className="quantity-box">
                <button
                  type="button"
                  onClick={() => {
                    if (quantity > 1) {
                      setQuantity(quantity - 1);
                    }
                  }}
                >
                  -
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      selectedVariant &&
                      quantity >= Number(selectedVariant.SoLuong)
                    ) {
                      alert(`Chỉ còn ${selectedVariant.SoLuong} sản phẩm`);
                      return;
                    }

                    setQuantity(quantity + 1);
                  }}
                >
                  +
                </button>
              </div>

              {selectedVariant && (
                <p className="stock-text">
                  Còn lại: {selectedVariant.SoLuong} sản phẩm
                </p>
              )}
            </div>

            <div className="detail-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.MoTa}</p>
            </div>

            <button
              type="button"
              className="add-cart-btn"
              onClick={handleAddCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        <section className="comment-section">
          <h2>Bình luận sản phẩm</h2>

          {user ? (
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Nhập bình luận của bạn..."
                maxLength={500}
              />

              <div className="comment-form-footer">
                <span>{commentContent.length}/500</span>

                <button
                  type="submit"
                  disabled={commentLoading || !commentContent.trim()}
                >
                  {commentLoading ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>
          ) : (
            <p className="comment-login-message">
              Vui lòng đăng nhập để bình luận sản phẩm.
            </p>
          )}

          <div className="comment-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div className="comment-item" key={comment.MaBinhLuan}>
                  <div className="comment-header">
                    <div className="comment-user-info">
                      <strong>{comment.HoTen || "Người dùng"}</strong>

                      {comment.VaiTroNguoiDang === "Admin" && (
                        <span className="admin-badge">Quản trị viên</span>
                      )}

                      {comment.NgayBinhLuan && (
                        <span className="comment-date">
                          {new Date(comment.NgayBinhLuan).toLocaleString(
                            "vi-VN",
                          )}
                        </span>
                      )}
                    </div>

                    {user &&
                      Number(user.MaNguoiDung) ===
                        Number(comment.MaNguoiDung) && (
                        <button
                          type="button"
                          className="delete-comment-btn"
                          onClick={() =>
                            handleDeleteComment(comment.MaBinhLuan)
                          }
                        >
                          Xóa
                        </button>
                      )}
                  </div>

                  <p>{comment.NoiDung}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">
                Chưa có bình luận nào cho sản phẩm này.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default DetailProduct;
