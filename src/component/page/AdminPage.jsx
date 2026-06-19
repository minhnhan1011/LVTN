import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../asset/AdminPage.css";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  const handleLogout = () => {
    axios
      .get("http://localhost:5000/logout")
      .then(() => window.location.reload(true))
      .catch((err) => console.log(err));
  };

  const [editUser, setEditUser] = useState({
    MaNguoiDung: "",
    HoTen: "",
    Email: "",
    MatKhau: "",
    SoDienThoai: "",
    VaiTro: "Customer",
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setShowEdit(true);
    setEditUser({
      MaNguoiDung: user.MaNguoiDung,
      HoTen: user.HoTen,
      Email: user.Email,
      MatKhau: user.MatKhau,
      SoDienThoai: user.SoDienThoai || "",
      VaiTro: user.VaiTro,
    });
  };

  const handleEditChange = (e) => {
    setEditUser({
      ...editUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/admin/users/${editUser.MaNguoiDung}`,
        editUser
      );

      alert("Cập nhật user thành công");
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Cập nhật thất bại");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/users/${id}`);
      alert("Xóa user thành công");
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Xóa thất bại");
    }
  };

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

      <main className="admin-content">
        <h1>Quản lý User</h1>

        {showEdit && (
          <form className="admin-edit-form" onSubmit={handleUpdateUser}>
            <h2>Sửa tài khoản</h2>

            <input
              type="text"
              name="HoTen"
              value={editUser.HoTen}
              onChange={handleEditChange}
              placeholder="Họ tên"
              required
            />

            <input
              type="email"
              name="Email"
              value={editUser.Email}
              onChange={handleEditChange}
              placeholder="Email"
              required
            />

            <input
              type="text"
              name="MatKhau"
              value={editUser.MatKhau}
              onChange={handleEditChange}
              placeholder="Mật khẩu"
              required
            />

            <input
              type="text"
              name="SoDienThoai"
              value={editUser.SoDienThoai}
              onChange={handleEditChange}
              placeholder="Số điện thoại"
            />

            <select
              name="VaiTro"
              value={editUser.VaiTro}
              onChange={handleEditChange}
            >
              <option value="Admin">Admin</option>
              <option value="Customer">Customer</option>
            </select>

            <div className="admin-form-actions">
              <button type="submit" className="btn-save">
                Lưu thay đổi
              </button>

              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowEdit(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <table className="admin-user-table">
          <thead>
            <tr>
              <th>Mã user</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Mật khẩu</th>
              <th>Quyền</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.MaNguoiDung}>
                <td>{user.MaNguoiDung}</td>
                <td>{user.HoTen}</td>
                <td>{user.Email}</td>
                <td>{user.SoDienThoai}</td>
                <td>{user.MatKhau}</td>
                <td>
                  <span
                    className={
                      user.VaiTro === "Admin"
                        ? "role-admin"
                        : "role-customer"
                    }
                  >
                    {user.VaiTro}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(user)}
                    >
                      Sửa
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.MaNguoiDung)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default AdminPage;