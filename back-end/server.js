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

// APi quan ly user
app.get("/admin/users", (req, res) => {
  const sql = `
    SELECT 
      MaNguoiDung,
      HoTen,
      Email,
      SoDienThoai,
      MatKhau,
      VaiTro
    FROM nguoidung
    ORDER BY MaNguoiDung ASC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.put("/admin/users/:id", (req, res) => {
  const { id } = req.params;
  const { HoTen, Email, MatKhau, SoDienThoai, VaiTro } = req.body;

  const sql = `
    UPDATE nguoidung
    SET HoTen = ?, Email = ?, MatKhau = ?, SoDienThoai = ?, VaiTro = ?
    WHERE MaNguoiDung = ?
  `;

  db.query(sql, [HoTen, Email, MatKhau, SoDienThoai, VaiTro, id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ status: "Success" });
  });
});

app.delete("/admin/users/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM nguoidung WHERE MaNguoiDung = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ status: "Success" });
  });
});

app.delete("/admin/users/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM nguoidung WHERE MaNguoiDung = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ status: "Success" });
  });
});

// API quản lý sản phẩm

app.get("/admin/product-types", (req, res) => {
  db.query("SELECT * FROM loaisanpham", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/admin/brands", (req, res) => {
  db.query("SELECT * FROM thuonghieu", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/admin/colors", (req, res) => {
  db.query("SELECT * FROM mausac", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/admin/sizes", (req, res) => {
  db.query("SELECT * FROM size", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/admin/products", (req, res) => {
  const sql = `
    SELECT 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.MoTa,
      sp.DonGia,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ha.DuongDan,
      GROUP_CONCAT(
        DISTINCT ms.TenMauSac
        ORDER BY ms.TenMauSac
        SEPARATOR ', '
      ) AS DanhSachMau,
      GROUP_CONCAT(
        DISTINCT sz.TenSize
        ORDER BY sz.TenSize
        SEPARATOR ', '
      ) AS DanhSachSize,
      COALESCE(SUM(bt.SoLuong), 0) AS TongSoLuong
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp 
      ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN thuonghieu th 
      ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN hinhanh ha 
      ON sp.MaSanPham = ha.MaSanPham
    LEFT JOIN sanpham_bienthe bt 
      ON sp.MaSanPham = bt.MaSanPham
    LEFT JOIN mausac ms 
      ON bt.MaMauSac = ms.MaMauSac
    LEFT JOIN size sz 
      ON bt.MaSize = sz.MaSize
    GROUP BY 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.MoTa,
      sp.DonGia,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ha.DuongDan
    ORDER BY sp.MaSanPham DESC
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.log("Lỗi lấy sản phẩm:", err);
      return res.status(500).json(err);
    }

    return res.json(data);
  });
});

app.post("/admin/products", upload.single("HinhAnh"), (req, res) => {
  const {
    TenSanPham,
    MaLoaiSanPham,
    MaThuongHieu,
    DonGia,
    MoTa,
  } = req.body;

  if (!TenSanPham || !MaLoaiSanPham || !MaThuongHieu || !DonGia) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin sản phẩm",
    });
  }

  if (Number(DonGia) <= 0) {
    return res.status(400).json({
      message: "Đơn giá phải lớn hơn 0",
    });
  }

  let variants = [];

  try {
    variants = JSON.parse(req.body.variants || "[]");
  } catch (err) {
    return res.status(400).json({
      message: "Dữ liệu biến thể không hợp lệ",
    });
  }

  if (variants.length === 0) {
    return res.status(400).json({
      message: "Vui lòng thêm ít nhất 1 biến thể sản phẩm",
    });
  }

  for (let item of variants) {
    if (!item.MaMauSac || !item.MaSize || item.SoLuong === "") {
      return res.status(400).json({
        message: "Biến thể phải có màu, size và số lượng",
      });
    }

    if (Number(item.SoLuong) <= 0) {
      return res.status(400).json({
        message: "Số lượng phải lớn hơn 0",
      });
    }
  }

  const sqlProduct = `
    INSERT INTO sanpham
    (TenSanPham, MaLoaiSanPham, MaThuongHieu, DonGia, MoTa)
    VALUES (?, ?, ?, ?, ?)
  `;

  const productValues = [
    TenSanPham,
    MaLoaiSanPham,
    MaThuongHieu,
    DonGia,
    MoTa || "",
  ];

  db.query(sqlProduct, productValues, (err, data) => {
    if (err) {
      console.log("Lỗi thêm sản phẩm:", err);
      return res.status(500).json(err);
    }

    const maSanPham = data.insertId;

    const sqlVariant = `
      INSERT INTO sanpham_bienthe
      (MaSanPham, MaMauSac, MaSize, SoLuong)
      VALUES ?
    `;

    const variantValues = variants.map((item) => [
      maSanPham,
      item.MaMauSac,
      item.MaSize,
      Number(item.SoLuong),
    ]);

    db.query(sqlVariant, [variantValues], (err2) => {
      if (err2) {
        console.log("Lỗi thêm biến thể:", err2);
        return res.status(500).json(err2);
      }

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

      db.query(sqlImage, imageValues, (err3) => {
        if (err3) {
          console.log("Lỗi thêm hình ảnh:", err3);
          return res.status(500).json(err3);
        }

        return res.json({ status: "Success" });
      });
    });
  });
});

app.delete("/admin/products/:id", (req, res) => {
  const id = req.params.id;

  const sqlDeleteVariant = "DELETE FROM sanpham_bienthe WHERE MaSanPham = ?";

  db.query(sqlDeleteVariant, [id], (err) => {
    if (err) return res.status(500).json(err);

    const sqlDeleteImage = "DELETE FROM hinhanh WHERE MaSanPham = ?";

    db.query(sqlDeleteImage, [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      const sqlDeleteProduct = "DELETE FROM sanpham WHERE MaSanPham = ?";

      db.query(sqlDeleteProduct, [id], (err3) => {
        if (err3) return res.status(500).json(err3);

        return res.json({ status: "Success" });
      });
    });
  });
});



// API lấy chi tiết sản phẩm
app.get("/product/:id", (req, res) => {
  const sqlProduct = `
    SELECT
      sp.MaSanPham,
      sp.TenSanPham,
      sp.DonGia,
      sp.MoTa,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ha.DuongDan
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp
      ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN thuonghieu th
      ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN hinhanh ha
      ON sp.MaSanPham = ha.MaSanPham
    WHERE sp.MaSanPham = ?
    LIMIT 1
  `;

  db.query(sqlProduct, [req.params.id], (err, productData) => {
    if (err) return res.status(500).json(err);

    if (productData.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const sqlVariants = `
      SELECT
        bt.MaBienThe,
        bt.MaMauSac,
        ms.TenMauSac,
        bt.MaSize,
        sz.TenSize,
        bt.SoLuong
      FROM sanpham_bienthe bt
      LEFT JOIN mausac ms ON bt.MaMauSac = ms.MaMauSac
      LEFT JOIN size sz ON bt.MaSize = sz.MaSize
      WHERE bt.MaSanPham = ?
    `;

    db.query(sqlVariants, [req.params.id], (err2, variantData) => {
      if (err2) return res.status(500).json(err2);

      return res.json({
        ...productData[0],
        variants: variantData,
      });
    });
  });
});

app.listen(5000, () => {
  console.log("Server đang chạy trên cổng 5000");
});
