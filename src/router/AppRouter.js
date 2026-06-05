import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../component/page/HomePage";
import Login from "../component/page/Login";
import AdminPage from "../component/page/AdminPage";
import Signup from "../component/page/Signup";
import Products from "../component/page/Products";

function AppRouter() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;