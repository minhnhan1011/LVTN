import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../component/page/HomePage";
import Login from "../component/page/Login";

function AppRouter() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;