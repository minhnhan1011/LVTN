const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");

const client = new OAuth2Client(
  "796564877926-jseo3et4poimu4iuje2vufomeejdgse5.apps.googleusercontent.com",
);

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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

app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        "796564877926-jseo3et4poimu4iuje2vufomeejdgse5.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    const sqlCheck = "SELECT * FROM NguoiDung WHERE Email = ?";

    db.query(sqlCheck, [email], (err, data) => {
      if (err) {
        return res.json({ status: "Error" });
      }

      if (data.length > 0) {
        const user = data[0];

        const token = jwt.sign(
          {
            MaNguoiDung: user.MaNguoiDung,
            HoTen: user.HoTen,
            VaiTro: user.VaiTro,
          },
          "jwt-secret-key",
          { expiresIn: "1h" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
        });

        return res.json({
          status: "Success",
          user,
        });
      }

      const sqlInsert = `
        INSERT INTO NguoiDung
        (HoTen, Email, MatKhau, SoDienThoai, VaiTro)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sqlInsert,
        [name, email, "GOOGLE_LOGIN", "", "Customer"],
        (err2, result) => {
          if (err2) {
            console.log(err2);
            return res.json({ status: "Error" });
          }

          const newUser = {
            MaNguoiDung: result.insertId,
            HoTen: name,
            Email: email,
            VaiTro: "Customer",
          };

          const token = jwt.sign(
            {
              MaNguoiDung: newUser.MaNguoiDung,
              HoTen: newUser.HoTen,
              VaiTro: newUser.VaiTro,
            },
            "jwt-secret-key",
            { expiresIn: "1h" },
          );

          res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
          });

          return res.json({
            status: "Success",
            user: newUser,
          });
        },
      );
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "Error",
      message: "Google token không hợp lệ",
    });
  }
});

app.post("/signup", (req, res) => {
  const { HoTen, Email, SoDienThoai, MatKhau } = req.body;
  const sqlCheck = "SELECT * FROM NguoiDung WHERE Email = ?";

  db.query(sqlCheck, [Email], (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ status: "Error" });
    }
    if (data.length > 0) {
      return res.json({ status: "Fail", message: "Email đã tồn tại" });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(Email)) {
      return res.json({
        status: "Fail",
        message: "Vui lòng nhập đúng định dạng email",
      });
    }

    if (MatKhau.length < 6) {
      return res.json({
        status: "Fail",
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const sql =
      "INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro) VALUES (?, ?, ?, ?, 'Customer')";
    db.query(sql, [HoTen, Email, SoDienThoai, MatKhau], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ status: "Error" });
      }
      return res.json({ status: "Success" });
    });
  });
});

app.get("/admin/product-types", (req, res) => {
  db.query("SELECT * FROM loaisanpham", (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/brands", (req, res) => {
  db.query("SELECT * FROM thuonghieu", (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/colors", (req, res) => {
  db.query("SELECT * FROM mausac", (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/sizes", (req, res) => {
  db.query("SELECT * FROM size", (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/admin/products", (req, res) => {
  const sql = `
    SELECT 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.MoTa,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ms.TenMauSac,
      sz.TenSize,
      sp.DonGia,
      sp.SoLuong,
      ha.DuongDan
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN thuonghieu th ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN mausac ms ON sp.MaMauSac = ms.MaMauSac
    LEFT JOIN size sz ON sp.MaSize = sz.MaSize
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    GROUP BY sp.MaSanPham
    ORDER BY sp.MaSanPham DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/admin/products", upload.single("HinhAnh"), (req, res) => {
  const sqlProduct = `
  INSERT INTO sanpham
  (TenSanPham, MaLoaiSanPham, MaThuongHieu, MaMauSac, MaSize, DonGia, SoLuong, MoTa)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

  const values = [
    req.body.TenSanPham,
    req.body.MaLoaiSanPham,
    req.body.MaThuongHieu,
    req.body.MaMauSac,
    req.body.MaSize,
    req.body.DonGia,
    req.body.SoLuong,
    req.body.MoTa,
  ];

  db.query(sqlProduct, values, (err, data) => {
    if (err) {
      console.log("Lỗi thêm sản phẩm:", err);
      return res.status(500).json(err);
    }

    const maSanPham = data.insertId;

    if (!req.file) {
      return res.json({ status: "Success" });
    }

    const sqlImage = `
      INSERT INTO hinhanh
      (MaHinhAnh, MaSanPham, DuongDan)
      VALUES (?, ?, ?)
    `;

    const imageValues = [
      crypto.randomUUID(),
      maSanPham,
      `/uploads/${req.file.filename}`,
    ];

    db.query(sqlImage, imageValues, (err2) => {
      if (err2) {
        console.log("Lỗi thêm hình ảnh:", err2);
        return res.status(500).json(err2);
      }

      return res.json({ status: "Success" });
    });
  });
});

app.delete("/admin/products/:id", (req, res) => {
  const id = req.params.id;

  const sqlDeleteImage = "DELETE FROM hinhanh WHERE MaSanPham = ?";

  db.query(sqlDeleteImage, [id], (err) => {
    if (err) return res.status(500).json(err);

    const sqlDeleteProduct = "DELETE FROM sanpham WHERE MaSanPham = ?";

    db.query(sqlDeleteProduct, [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      return res.json({ status: "Success" });
    });
  });
});

app.listen(5000, () => {
  console.log("Server đang chạy trên cổng 5000");
});
