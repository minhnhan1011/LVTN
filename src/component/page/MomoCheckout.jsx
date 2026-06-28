import React, { useEffect, useState } from "react";
import axios from "axios";

function MomoCheckout() {
  const [message, setMessage] = useState("Đang chuyển sang MoMo...");

  useEffect(() => {
    const payMomo = async () => {
      const data = localStorage.getItem("momoCheckoutData");

      if (!data) {
        setMessage("Không tìm thấy dữ liệu thanh toán");
        return;
      }

      try {
        const momoData = JSON.parse(data);

        if (!momoData.MaDonHang) {
          setMessage("Không tìm thấy mã đơn hàng");
          return;
        }

        const res = await axios.post("http://localhost:5000/payment/momo", {
          amount: momoData.TongTien,
          MaDonHang: momoData.MaDonHang,
        });

        if (res.data.payUrl) {
          localStorage.removeItem("checkoutItems");
          localStorage.removeItem("momoCheckoutData");

          window.location.href = res.data.payUrl;
        } else {
          setMessage("Không nhận được link thanh toán MoMo");
        }
      } catch (err) {
        console.log(err.response?.data || err);
        setMessage("Tạo thanh toán MoMo thất bại");
      }
    };

    payMomo();
  }, []);

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h2>{message}</h2>
      <p>Vui lòng không tắt trang trong lúc chuyển hướng.</p>
    </div>
  );
}

export default MomoCheckout;