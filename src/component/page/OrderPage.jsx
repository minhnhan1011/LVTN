import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import axios from "axios";
import "../asset/OrderPage.css";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const MaNguoiDung = localStorage.getItem("MaNguoiDung");
  const ordersPerPage = 5;

  const convertStatus = (status) => {
    if (status === "ChoXacNhan") return "Đang chờ";
    if (status === "DaXacNhan") return "Đã xác nhận";
    if (status === "DangGiao") return "Đang giao";
    if (status === "HoanThanh") return "Đã giao";
    if (status === "DaHuy") return "Đã hủy";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "ChoXacNhan") return "pending";
    if (status === "DaXacNhan") return "confirmed";
    if (status === "DangGiao") return "shipping";
    if (status === "HoanThanh") return "delivered";
    if (status === "DaHuy") return "cancelled";
    return "";
  };

  const fetchOrders = async () => {
    if (!MaNguoiDung) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/orders/${MaNguoiDung}`
      );

      const groupedOrders = {};

      res.data.forEach((item) => {
        if (!groupedOrders[item.MaDonHang]) {
          groupedOrders[item.MaDonHang] = {
            MaDonHang: item.MaDonHang,
            SoDonHang: item.SoDonHang,
            TongTien: item.TongTien,
            TrangThai: item.TrangThai,
            HoTen: item.HoTen,
            SoDienThoai: item.SoDienThoai,
            DiaChi: `${item.DiaChiChiTiet}, ${item.Phuong}, ${item.Quan}, ${item.ThanhPho}`,
            PhuongThucThanhToan: item.PhuongThucThanhToan,
            SanPham: [],
          };
        }

        groupedOrders[item.MaDonHang].SanPham.push({
          MaDonHangChiTiet: item.MaDonHangChiTiet,
          TenSanPham: item.TenSanPham,
          TenMauSac: item.TenMauSac,
          TenSize: item.TenSize,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia,
          DuongDan: item.DuongDan,
        });
      });

      setOrders(Object.values(groupedOrders));
      setCurrentPage(1);
    } catch (err) {
      console.log(err.response?.data || err);
      alert(err.response?.data?.message || "Lỗi lấy danh sách đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [MaNguoiDung]);

  const handleCancelOrder = async (MaDonHang) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await axios.put(`http://localhost:5000/orders/cancel/${MaDonHang}`);

      alert("Đã hủy đơn hàng");
      fetchOrders();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Hủy đơn thất bại");
    }
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <>
      <Header />

      <main className="order-page">
        <h1>Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="empty-order">Bạn chưa có đơn hàng nào</div>
        ) : (
          <>
            <div className="order-list">
              {currentOrders.map((order) => (
                <div className="order-card" key={order.MaDonHang}>
                  <div className="order-top">
                    <div>
                      <h2>
                        Đơn hàng #{String(order.SoDonHang).padStart(1, "0")}
                      </h2>
                    </div>

                    <span
                      className={`order-status ${getStatusClass(
                        order.TrangThai
                      )}`}
                    >
                      {convertStatus(order.TrangThai)}
                    </span>
                  </div>

                  <div className="order-customer">
                    <p>
                      <strong>Người nhận:</strong> {order.HoTen}
                    </p>
                    <p>
                      <strong>SĐT:</strong> {order.SoDienThoai}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {order.DiaChi}
                    </p>
                    <p>
                      <strong>Thanh toán:</strong>{" "}
                      {order.PhuongThucThanhToan}
                    </p>
                  </div>

                  {order.SanPham.map((item) => (
                    <div className="order-product" key={item.MaDonHangChiTiet}>
                      <img
                        src={
                          item.DuongDan
                            ? `http://localhost:5000${item.DuongDan}`
                            : "/no-image.png"
                        }
                        alt={item.TenSanPham}
                      />

                      <div className="order-info">
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

                  <div className="order-footer">
                    {order.TrangThai === "ChoXacNhan" && (
                      <button
                        type="button"
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order.MaDonHang)}
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    <div className="order-total">
                      <span>Tổng tiền:</span>
                      <strong>
                        {Number(order.TongTien).toLocaleString()}đ
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    type="button"
                    key={index + 1}
                    className={currentPage === index + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default OrderPage;