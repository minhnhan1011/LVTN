import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../asset/AdminOrder.css";

function AdminOrder() {
  const [orders, setOrders] = useState([]);

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
        { TrangThai: "DaXacNhan" }
      );

      alert("Đã tạo/xác nhận đơn hàng");
      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Tạo đơn hàng thất bại");
    }
  };

  const handleChangeStatus = async (MaDonHang, TrangThai) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/orders/${MaDonHang}/status`,
        { TrangThai }
      );

      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const totalOrders = orders.length;
  const shippingOrders = orders.filter((o) => o.TrangThai === "DangGiao").length;
  const doneOrders = orders.filter((o) => o.TrangThai === "HoanThanh").length;
  const cancelOrders = orders.filter((o) => o.TrangThai === "DaHuy").length;

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
            <p>Theo dõi trạng thái và quản lý đơn hàng khách hàng.</p>
          </div>

          <button className="create-order-btn">
            + Tạo đơn hàng
          </button>
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
              {orders.map((order) => (
                <tr key={order.MaDonHang}>
                  <td>#DH{String(order.SoDonHang).padStart(4, "0")}</td>
                  <td>{order.HoTen}</td>
                  <td>{order.PhuongThucThanhToan}</td>

                  <td>
                    <span
                      className={`order-badge ${getStatusClass(
                        order.TrangThai
                      )}`}
                    >
                      {convertStatus(order.TrangThai)}
                    </span>
                  </td>

                  <td>{Number(order.TongTien).toLocaleString()}đ</td>

                  <td>
                    {order.TrangThai === "ChoXacNhan" ? (
                      <button
                        className="order-action-btn create"
                        onClick={() => handleCreateOrder(order.MaDonHang)}
                      >
                        Tạo đơn
                      </button>
                    ) : order.TrangThai === "DaHuy" ? (
                      <button className="order-action-btn disabled" disabled>
                        Đã hủy
                      </button>
                    ) : (
                      <select
                        className="status-select"
                        value={order.TrangThai}
                        onChange={(e) =>
                          handleChangeStatus(order.MaDonHang, e.target.value)
                        }
                      >
                        <option value="DaXacNhan">Đã xác nhận</option>
                        <option value="DangGiao">Đang giao</option>
                        <option value="HoanThanh">Hoàn thành</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminOrder;