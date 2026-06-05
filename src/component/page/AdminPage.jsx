import React from "react";
import { Link } from "react-router-dom";
import "../asset/AdminPage.css";

function AdminPage() {
  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin</h2>

        <nav className="admin-nav">
          <Link to="/admin">Tổng quan</Link>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
          <Link to="/">Về trang chủ</Link>
        </nav>
      </aside>

      <main className="admin-content">
        <h1>Tổng quan</h1>
      </main>
    </div>
  );
}

export default AdminPage;
