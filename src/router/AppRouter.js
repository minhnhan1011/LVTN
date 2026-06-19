import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../component/page/HomePage";
import Login from "../component/page/Login";
import AdminPage from "../component/page/AdminPage";
import Signup from "../component/page/Signup";
import ProductAdmin from "../component/page/ProductAdmin";
import ProductPage from "../component/page/ProductPage";
import DetailProduct from "../component/page/DetailProduct";
import Cart from "../component/page/Cart";
import CheckoutPage from "../component/page/CheckoutPage";
import OrderPage from "../component/page/OrderPage";
import AdminOrder from "../component/page/AdminOrder";

function AppRouter() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<ProductAdmin />} />
        <Route path="/productpage" element={<ProductPage />} />
        <Route path="/detailproduct/:id" element={<DetailProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orderpage" element={<OrderPage />} />
        <Route path="/admin/order" element={<AdminOrder />} />"
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;