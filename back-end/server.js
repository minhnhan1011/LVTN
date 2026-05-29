const expess = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = expess();

app.use(expess.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET"],
    credentials: true,
  }),
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "qlbangiay",
});

db.connect((err) => {
  if (err) {
    console.error("Kết nối thất bại:", err);
    return;
  }
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Message: "Bạn chưa đăng nhập" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ Message: "Token không hợp lệ" });
      } else {
        req.HoTen = decoded.HoTen;
        req.MaNguoiDung = decoded.MaNguoiDung;
        next();
      }
    });
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token không hợp lệ" });
      }

      if (!roles.includes(decoded.VaiTro)) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

      req.user = decoded;
      next();
    });
  };
};

app.get("/logout", function (req, res) {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

app.get("/auth", verifyUser, (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error" });
    }

    return res.json({
      Status: "Success",
      HoTen: decoded.HoTen,
      MaNguoiDung: decoded.MaNguoiDung,
      VaiTro: decoded.VaiTro,
    });
  });
});

app.post("/login", (req, res) => {
  const sql =
    "SELECT * FROM nguoidung WHERE (Email = ? OR SoDienThoai = ?) AND MatKhau = ?";

  db.query(
    sql,
    [req.body.username, req.body.username, req.body.password],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.json({ status: "Error" });
      }

      if (data.length > 0) {
        const token = jwt.sign(
          {
            HoTen: data[0].HoTen,
            MaNguoiDung: data[0].MaNguoiDung,
            VaiTro: data[0].VaiTro,
          },
          "jwt-secret-key",
          { expiresIn: "1h" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });

        return res.json({
          status: "Success",
          user: data[0],
          VaiTro: data[0].VaiTro,
        });
      }

      return res.json({ status: "Fail" });
    },
  );
});

app.listen(5000, () => {
  console.log("Server đang chạy trên cổng 5000");
});
