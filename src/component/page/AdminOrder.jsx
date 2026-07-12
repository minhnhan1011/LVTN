import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../asset/AdminOrder.css";

function AdminOrder() {
  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
      alert("Lỗi lấy đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const convertStatus = (status) => {
    if (status === "ChoXacNhan") return "Chờ xác nhận";
    if (status === "DaXacNhan") return "Đã xác nhận";
    if (status === "DangGiao") return "Đang giao";
    if (status === "HoanThanh") return "Hoàn thành";
    if (status === "DaHuy") return "Đã hủy";

    return status;
  };

  const getStatusClass = (status) => {
    if (status === "ChoXacNhan") return "pending";
    if (status === "DaXacNhan") return "confirmed";
    if (status === "DangGiao") return "shipping";
    if (status === "HoanThanh") return "done";
    if (status === "DaHuy") return "cancel";

    return "";
  };

  const handleCreateOrder = async (MaDonHang) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/orders/${MaDonHang}/status`,
        {
          TrangThai: "DaXacNhan",
        },
      );

      alert("Đã tạo/xác nhận đơn hàng");
      fetchOrders();
    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message || "Tạo đơn hàng thất bại",
      );
    }
  };

  const handleChangeStatus = async (MaDonHang, TrangThai) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/orders/${MaDonHang}/status`,
        {
          TrangThai,
        },
      );

      fetchOrders();
    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message ||
          "Cập nhật trạng thái thất bại",
      );
    }
  };

  const handleViewOrderDetail = async (MaDonHang) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      setSelectedOrder(null);
      setOrderDetails([]);

      const res = await axios.get(
        `http://localhost:5000/admin/orders/${MaDonHang}`,
      );

      setSelectedOrder(res.data.order);
      setOrderDetails(res.data.details || []);
    } catch (err) {
      console.log("Lỗi lấy chi tiết đơn hàng:", err);

      alert(
        err.response?.data?.message ||
          "Không thể lấy chi tiết đơn hàng",
      );

      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  const totalOrders = orders.length;

  const shippingOrders = orders.filter(
    (order) => order.TrangThai === "DangGiao",
  ).length;

  const doneOrders = orders.filter(
    (order) => order.TrangThai === "HoanThanh",
  ).length;

  const cancelOrders = orders.filter(
    (order) => order.TrangThai === "DaHuy",
  ).length;

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>

        <nav className="admin-nav">
          <Link to="/admin">Quản lý User</Link>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
          <Link to="/admin/order">Quản lý đơn hàng</Link>

          <Link to="/" onClick={handleLogout}>
            Đăng xuất
          </Link>
        </nav>
      </aside>

      <main className="admin-order-content">
        <section className="admin-order-header">
          <div>
            <h1>Quản lý đơn hàng</h1>

            <p>
              Theo dõi trạng thái và quản lý đơn hàng khách hàng.
            </p>
          </div>
        </section>

        <section className="order-stats">
          <div className="stat-card">
            <span>Tổng đơn hàng</span>
            <strong>{totalOrders}</strong>
          </div>

          <div className="stat-card">
            <span>Đang giao</span>
            <strong>{shippingOrders}</strong>
          </div>

          <div className="stat-card">
            <span>Hoàn thành</span>
            <strong>{doneOrders}</strong>
          </div>

          <div className="stat-card">
            <span>Đã hủy</span>
            <strong>{cancelOrders}</strong>
          </div>
        </section>

        <section className="admin-order-table-box">
          <table className="admin-order-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.MaDonHang}
                    className="order-row"
                    onClick={() =>
                      handleViewOrderDetail(order.MaDonHang)
                    }
                  >
                    <td>
                      #DH
                      {String(order.SoDonHang).padStart(4, "0")}
                    </td>

                    <td>{order.HoTen}</td>

                    <td>{order.PhuongThucThanhToan}</td>

                    <td>
                      <span
                        className={`order-badge ${getStatusClass(
                          order.TrangThai,
                        )}`}
                      >
                        {convertStatus(order.TrangThai)}
                      </span>
                    </td>

                    <td>
                      {Number(order.TongTien).toLocaleString()}đ
                    </td>

                    <td>
                      {order.TrangThai === "ChoXacNhan" ? (
                        <button
                          className="order-action-btn create"
                          onClick={(e) => {
                            e.stopPropagation();

                            handleCreateOrder(order.MaDonHang);
                          }}
                        >
                          Tạo đơn
                        </button>
                      ) : order.TrangThai === "DaHuy" ? (
                        <button
                          className="order-action-btn disabled"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                        >
                          Đã hủy
                        </button>
                      ) : (
                        <select
                          className="status-select"
                          value={order.TrangThai}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();

                            handleChangeStatus(
                              order.MaDonHang,
                              e.target.value,
                            );
                          }}
                        >
                          <option value="DaXacNhan">
                            Đã xác nhận
                          </option>

                          <option value="DangGiao">
                            Đang giao
                          </option>

                          <option value="HoanThanh">
                            Hoàn thành
                          </option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-order-row">
                    Chưa có đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {showDetail && (
          <div
            className="order-detail-overlay"
            onClick={handleCloseDetail}
          >
            <div
              className="order-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="order-detail-header">
                <div>
                  <h2>Chi tiết đơn hàng</h2>

                  {selectedOrder && (
                    <p>
                      Mã đơn:{" "}
                      <strong>
                        #DH
                        {String(
                          selectedOrder.SoDonHang ||
                            selectedOrder.MaDonHang,
                        ).padStart(4, "0")}
                      </strong>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="close-detail-btn"
                  onClick={handleCloseDetail}
                >
                  x
                </button>
              </div>

              {loadingDetail ? (
                <div className="order-detail-loading">
                  Đang tải chi tiết đơn hàng...
                </div>
              ) : selectedOrder ? (
                <>
                  <section className="customer-information">
                    <div className="customer-info-item">
                      <span>Khách hàng</span>
                      <strong>{selectedOrder.HoTen}</strong>
                    </div>

                    <div className="customer-info-item">
                      <span>Số điện thoại</span>

                      <strong>
                        {selectedOrder.SoDienThoai ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    <div className="customer-info-item">
                      <span>Phương thức thanh toán</span>

                      <strong>
                        {selectedOrder.PhuongThucThanhToan}
                      </strong>
                    </div>

                    <div className="customer-info-item">
                      <span>Trạng thái</span>

                      <span
                        className={`order-badge ${getStatusClass(
                          selectedOrder.TrangThai,
                        )}`}
                      >
                        {convertStatus(
                          selectedOrder.TrangThai,
                        )}
                      </span>
                    </div>

                    <div className="customer-info-item full-width">
                      <span>Địa chỉ giao hàng</span>

                      <strong>
                        {selectedOrder.DiaChi ||
                          selectedOrder.DiaChiGiaoHang ||
                          selectedOrder.DiaChiChiTiet ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>

                    {selectedOrder.GhiChu && (
                      <div className="customer-info-item full-width">
                        <span>Ghi chú</span>
                        <strong>{selectedOrder.GhiChu}</strong>
                      </div>
                    )}
                  </section>

                  <div className="order-product-title">
                    <h3>Danh sách sản phẩm</h3>

                    <span>
                      {orderDetails.length} sản phẩm
                    </span>
                  </div>

                  <div className="order-detail-table-box">
                    <table className="order-detail-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Màu</th>
                          <th>Size</th>
                          <th>Đơn giá</th>
                          <th>Số lượng</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orderDetails.length > 0 ? (
                          orderDetails.map((item, index) => (
                            <tr
                              key={
                                item.MaChiTietDonHang ||
                                item.MaBienThe ||
                                index
                              }
                            >
                              <td>
                                <div className="order-product-info">
                                  {item.DuongDan && (
                                    <img
                                      src={`http://localhost:5000${item.DuongDan}`}
                                      alt={item.TenSanPham}
                                    />
                                  )}

                                  <span>
                                    {item.TenSanPham}
                                  </span>
                                </div>
                              </td>

                              <td>
                                {item.TenMauSac || "Không có"}
                              </td>

                              <td>
                                {item.TenSize || "Không có"}
                              </td>

                              <td>
                                {Number(
                                  item.DonGia || 0,
                                ).toLocaleString()}
                                đ
                              </td>

                              <td>{item.SoLuong}</td>

                              <td>
                                {(
                                  Number(item.DonGia || 0) *
                                  Number(item.SoLuong || 0)
                                ).toLocaleString()}
                                đ
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="empty-order-detail"
                            >
                              Đơn hàng chưa có sản phẩm
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="order-detail-summary">
                    <div>
                      <span>Tổng số lượng</span>

                      <strong>
                        {orderDetails.reduce(
                          (total, item) =>
                            total + Number(item.SoLuong || 0),
                          0,
                        )}
                      </strong>
                    </div>

                    <div className="order-detail-total">
                      <span>Tổng tiền</span>

                      <strong>
                        {Number(
                          selectedOrder.TongTien || 0,
                        ).toLocaleString()}
                        đ
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-order-detail">
                  Không tìm thấy thông tin đơn hàng
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrder;