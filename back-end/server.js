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

// app.delete("/admin/users/:id", (req, res) => {
//   const { id } = req.params;

//   const sql = "DELETE FROM nguoidung WHERE MaNguoiDung = ?";

//   db.query(sql, [id], (err) => {
//     if (err) return res.status(500).json(err);
//     return res.json({ status: "Success" });
//   });
// });

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
      sp.KhuyenMai,
      sp.MaLoaiSanPham,
      sp.MaThuongHieu,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ha.DuongDan,
      GROUP_CONCAT(DISTINCT ms.TenMauSac ORDER BY ms.TenMauSac SEPARATOR ', ') AS DanhSachMau,
      GROUP_CONCAT(DISTINCT sz.TenSize ORDER BY sz.TenSize SEPARATOR ', ') AS DanhSachSize,
      COALESCE(SUM(bt.SoLuong), 0) AS TongSoLuong
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN thuonghieu th ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    LEFT JOIN sanpham_bienthe bt ON sp.MaSanPham = bt.MaSanPham
    LEFT JOIN mausac ms ON bt.MaMauSac = ms.MaMauSac
    LEFT JOIN size sz ON bt.MaSize = sz.MaSize
    GROUP BY 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.MoTa,
      sp.DonGia,
      sp.MaLoaiSanPham,
      sp.MaThuongHieu,
      lsp.TenLoaiSanPham,
      th.TenThuongHieu,
      ha.DuongDan
    ORDER BY sp.MaSanPham DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.post("/admin/products", upload.single("HinhAnh"), (req, res) => {
  const { TenSanPham, MaLoaiSanPham, MaThuongHieu, DonGia, MoTa } = req.body;

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

  const sqlCheckOrder = `
    SELECT dhct.*
    FROM donhangchitiet dhct
    JOIN sanpham_bienthe bt ON dhct.MaBienThe = bt.MaBienThe
    WHERE bt.MaSanPham = ?
  `;

  db.query(sqlCheckOrder, [id], (err, orderData) => {
    if (err) {
      console.log("Lỗi check đơn hàng:", err);
      return res.status(500).json(err);
    }

    if (orderData.length > 0) {
      return res.status(400).json({
        message:
          "Sản phẩm đã có trong đơn hàng, không nên xóa. Hãy ẩn sản phẩm thay vì xóa.",
      });
    }

    const sqlDeleteCart = `
      DELETE ghct
      FROM giohangchitiet ghct
      JOIN sanpham_bienthe bt ON ghct.MaBienThe = bt.MaBienThe
      WHERE bt.MaSanPham = ?
    `;

    db.query(sqlDeleteCart, [id], (err2) => {
      if (err2) {
        console.log("Lỗi xóa giỏ hàng:", err2);
        return res.status(500).json(err2);
      }

      db.query(
        "DELETE FROM sanpham_bienthe WHERE MaSanPham = ?",
        [id],
        (err3) => {
          if (err3) {
            console.log("Lỗi xóa biến thể:", err3);
            return res.status(500).json(err3);
          }

          db.query("DELETE FROM hinhanh WHERE MaSanPham = ?", [id], (err4) => {
            if (err4) {
              console.log("Lỗi xóa hình:", err4);
              return res.status(500).json(err4);
            }

            db.query(
              "DELETE FROM sanpham WHERE MaSanPham = ?",
              [id],
              (err5) => {
                if (err5) {
                  console.log("Lỗi xóa sản phẩm:", err5);
                  return res.status(500).json(err5);
                }

                return res.json({ status: "Success" });
              },
            );
          });
        },
      );
    });
  });
});

app.put("/admin/products/:id", (req, res) => {
  const { id } = req.params;

  const { TenSanPham, MaLoaiSanPham, MaThuongHieu, DonGia, MoTa, KhuyenMai } =
    req.body;

  const sql = `
    UPDATE sanpham
    SET 
      TenSanPham = ?,
      MaLoaiSanPham = ?,
      MaThuongHieu = ?,
      DonGia = ?,
      MoTa = ?,
      KhuyenMai = ?
    WHERE MaSanPham = ?
  `;

  db.query(
    sql,
    [
      TenSanPham,
      MaLoaiSanPham,
      MaThuongHieu,
      DonGia,
      MoTa || "",
      Number(KhuyenMai),
      id,
    ],
    (err) => {
      if (err) {
        console.log("Lỗi cập nhật sản phẩm:", err);
        return res.status(500).json(err);
      }

      return res.json({ status: "Success" });
    },
  );
});

// api bien the san pham cua admin
app.get("/admin/products/:id/variants", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      bt.MaBienThe,
      bt.MaSanPham,
      bt.MaMauSac,
      bt.MaSize,
      bt.SoLuong
    FROM sanpham_bienthe bt
    WHERE bt.MaSanPham = ?
  `;

  db.query(sql, [id], (err, data) => {
    if (err) {
      console.log("Lỗi lấy biến thể:", err);
      return res.status(500).json(err);
    }

    return res.json(data);
  });
});

app.put("/admin/products/:id/variants", (req, res) => {
  const { variants } = req.body;

  if (!variants || !Array.isArray(variants)) {
    return res.status(400).json({
      message: "Dữ liệu biến thể không hợp lệ",
    });
  }

  const sql = `
    UPDATE sanpham_bienthe
    SET MaMauSac = ?, MaSize = ?, SoLuong = ?
    WHERE MaBienThe = ?
  `;

  variants.forEach((item) => {
    db.query(sql, [
      item.MaMauSac,
      item.MaSize,
      Number(item.SoLuong),
      item.MaBienThe,
    ]);
  });

  return res.json({ status: "Success" });
});

// API xem chi tiết sản phẩm
app.get("/product/:id", (req, res) => {
  const sqlProduct = `
  SELECT
    sp.MaSanPham,
    sp.TenSanPham,
    sp.DonGia,
    sp.KhuyenMai,
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

// api xem danh sách sản phẩm ở trang chủ
app.get("/home/new-products", (req, res) => {
  const sql = `
  SELECT 
    sp.MaSanPham,
    sp.TenSanPham,
    sp.DonGia,
    sp.KhuyenMai,
    th.TenThuongHieu,
    ha.DuongDan
  FROM sanpham sp
  LEFT JOIN thuonghieu th ON sp.MaThuongHieu = th.MaThuongHieu
  LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
  GROUP BY sp.MaSanPham
  ORDER BY sp.MaSanPham DESC
  LIMIT 4
`;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/home/nike-products", (req, res) => {
  const sql = `
    SELECT 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.DonGia,
      sp.KhuyenMai,
      th.TenThuongHieu,
      ha.DuongDan
    FROM sanpham sp
    LEFT JOIN thuonghieu th ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    WHERE th.TenThuongHieu = 'Nike'
    GROUP BY sp.MaSanPham
    ORDER BY sp.MaSanPham DESC
    LIMIT 8
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get("/home/adidas-products", (req, res) => {
  const sql = `
    SELECT 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.DonGia,
      sp.KhuyenMai,
      th.TenThuongHieu,
      ha.DuongDan
    FROM sanpham sp
    LEFT JOIN thuonghieu th ON sp.MaThuongHieu = th.MaThuongHieu
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    WHERE th.TenThuongHieu = 'Adidas'
    GROUP BY sp.MaSanPham
    ORDER BY sp.MaSanPham DESC
    LIMIT 8
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

// api gio hang luu thong tin gio hang
app.post("/cart", (req, res) => {
  const { MaNguoiDung, MaBienThe, SoLuong } = req.body;

  if (!MaNguoiDung || !MaBienThe || Number(SoLuong) <= 0) {
    return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ" });
  }

  const sqlFindCart = `
    SELECT MaGioHang 
    FROM giohang 
    WHERE MaNguoiDung = ?
  `;

  db.query(sqlFindCart, [MaNguoiDung], (err, cartData) => {
    if (err) return res.status(500).json(err);

    const handleCartDetail = (maGioHang) => {
      const sqlCheckItem = `
        SELECT * 
        FROM giohangchitiet
        WHERE MaGioHang = ? AND MaBienThe = ?
      `;

      db.query(sqlCheckItem, [maGioHang, MaBienThe], (err2, itemData) => {
        if (err2) return res.status(500).json(err2);

        if (itemData.length > 0) {
          const sqlUpdate = `
            UPDATE giohangchitiet
            SET SoLuong = SoLuong + ?
            WHERE MaGioHang = ? AND MaBienThe = ?
          `;

          db.query(sqlUpdate, [SoLuong, maGioHang, MaBienThe], (err3) => {
            if (err3) return res.status(500).json(err3);
            return res.json({ status: "Success" });
          });
        } else {
          const sqlPrice = `
  SELECT 
    sp.DonGia,
    sp.KhuyenMai,
    (sp.DonGia - (sp.DonGia * IFNULL(sp.KhuyenMai, 0) / 100)) AS GiaSauGiam
  FROM sanpham_bienthe bt
  JOIN sanpham sp ON bt.MaSanPham = sp.MaSanPham
  WHERE bt.MaBienThe = ?
`;

          db.query(sqlPrice, [MaBienThe], (err4, priceData) => {
            if (err4) return res.status(500).json(err4);
            if (priceData.length === 0) {
              return res
                .status(404)
                .json({ message: "Không tìm thấy biến thể" });
            }

            const sqlInsertItem = `
              INSERT INTO giohangchitiet
              (MaGioHangChiTiet, MaGioHang, MaBienThe, SoLuong, DonGia)
              VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
              sqlInsertItem,
              [
                crypto.randomUUID(),
                maGioHang,
                MaBienThe,
                SoLuong,
                priceData[0].GiaSauGiam,
              ],
              (err5) => {
                if (err5) return res.status(500).json(err5);
                return res.json({ status: "Success" });
              },
            );
          });
        }
      });
    };

    if (cartData.length > 0) {
      handleCartDetail(cartData[0].MaGioHang);
    } else {
      const maGioHang = crypto.randomUUID();

      const sqlCreateCart = `
        INSERT INTO giohang (MaGioHang, MaNguoiDung, TongTien)
        VALUES (?, ?, 0)
      `;

      db.query(sqlCreateCart, [maGioHang, MaNguoiDung], (err6) => {
        if (err6) return res.status(500).json(err6);
        handleCartDetail(maGioHang);
      });
    }
  });
});

app.get("/cart/:MaNguoiDung", (req, res) => {
  const sql = `
    SELECT
      ghct.MaGioHangChiTiet,
      ghct.MaBienThe,
      ghct.SoLuong,
      ghct.DonGia,
      sp.DonGia AS DonGiaGoc,
      sp.KhuyenMai,
      sp.TenSanPham,
      sp.MaSanPham,
      ms.TenMauSac,
      sz.TenSize,
      ha.DuongDan
    FROM giohang gh
    JOIN giohangchitiet ghct ON gh.MaGioHang = ghct.MaGioHang
    JOIN sanpham_bienthe bt ON ghct.MaBienThe = bt.MaBienThe
    JOIN sanpham sp ON bt.MaSanPham = sp.MaSanPham
    JOIN mausac ms ON bt.MaMauSac = ms.MaMauSac
    JOIN size sz ON bt.MaSize = sz.MaSize
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    WHERE gh.MaNguoiDung = ?
  `;

  db.query(sql, [req.params.MaNguoiDung], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.delete("/cart/detail/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM giohangchitiet
    WHERE MaGioHangChiTiet = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    return res.json({ status: "Success" });
  });
});

//api dat hang
app.get("/orders/:MaNguoiDung", (req, res) => {
  const { MaNguoiDung } = req.params;

  const sql = `
    SELECT
      dh.SoDonHang,
      dh.MaDonHang,
      dh.TongTien,
      dh.TrangThai,
      dc.HoTen,
      dc.SoDienThoai,
      dc.DiaChiChiTiet,
      dc.Phuong,
      dc.Quan,
      dc.ThanhPho,
      tt.PhuongThucThanhToan,
      dhct.MaDonHangChiTiet,
      dhct.SoLuong,
      dhct.DonGia,
      sp.TenSanPham,
      ms.TenMauSac,
      sz.TenSize,
      ha.DuongDan
    FROM donhang dh
    JOIN diachi dc ON dh.MaDiaChi = dc.MaDiaChi
    JOIN donhangchitiet dhct ON dh.MaDonHang = dhct.MaDonHang
    JOIN sanpham_bienthe bt ON dhct.MaBienThe = bt.MaBienThe
    JOIN sanpham sp ON bt.MaSanPham = sp.MaSanPham
    JOIN mausac ms ON bt.MaMauSac = ms.MaMauSac
    JOIN size sz ON bt.MaSize = sz.MaSize
    LEFT JOIN hinhanh ha ON sp.MaSanPham = ha.MaSanPham
    LEFT JOIN thanhtoan tt ON dh.MaDonHang = tt.MaDonHang
    WHERE dh.MaNguoiDung = ?
    ORDER BY dh.SoDonHang DESC
  `;

  db.query(sql, [MaNguoiDung], (err, data) => {
    if (err) {
      console.log("LỖI LẤY ĐƠN HÀNG:", err);
      return res.status(500).json({
        message: "Lỗi lấy danh sách đơn hàng",
      });
    }

    return res.json(data);
  });
});

app.post("/checkout", (req, res) => {
  const {
    MaNguoiDung,
    HoTen,
    SoDienThoai,
    DiaChiChiTiet,
    Phuong,
    Quan,
    ThanhPho,
    PhuongThucThanhToan,
    items,
    TongTien,
  } = req.body;

  if (
    !MaNguoiDung ||
    !HoTen ||
    !SoDienThoai ||
    !DiaChiChiTiet ||
    !Phuong ||
    !Quan ||
    !ThanhPho ||
    !items ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin đặt hàng",
    });
  }

  const sqlAddress = `
    INSERT INTO diachi
    (MaDiaChi, MaNguoiDung, HoTen, SoDienThoai, DiaChiChiTiet, Phuong, Quan, ThanhPho)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sqlAddress,
    [
      MaDiaChi,
      MaNguoiDung,
      HoTen,
      SoDienThoai,
      DiaChiChiTiet,
      Phuong,
      Quan,
      ThanhPho,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      const sqlOrder = `
        INSERT INTO donhang
        (MaDonHang, MaNguoiDung, MaDiaChi, TongTien, TrangThai)
        VALUES (?, ?, ?, ?, 'ChoXacNhan')
      `;

      db.query(
        sqlOrder,
        [MaDonHang, MaNguoiDung, MaDiaChi, TongTien],
        (err2) => {
          if (err2) {
            return res.status(500).json(err2);
          }

          const detailValues = items.map((item) => [
            crypto.randomUUID(),
            MaDonHang,
            item.MaBienThe,
            item.SoLuong,
            item.DonGia,
          ]);

          const sqlDetail = `
          INSERT INTO donhangchitiet
          (MaDonHangChiTiet, MaDonHang, MaBienThe, SoLuong, DonGia)
          VALUES ?
        `;

          db.query(sqlDetail, [detailValues], (err3) => {
            if (err3) {
              return res.status(500).json(err3);
            }

            const sqlPayment = `
            INSERT INTO thanhtoan
            (MaThanhToan, MaDonHang, PhuongThucThanhToan, SoTienThanhToan, TrangThai)
            VALUES (?, ?, ?, ?, ?)
          `;

            const paymentStatus =
              PhuongThucThanhToan === "COD" ? "ChuaThanhToan" : "DaThanhToan";

            db.query(
              sqlPayment,
              [
                MaThanhToan,
                MaDonHang,
                PhuongThucThanhToan,
                TongTien,
                paymentStatus,
              ],
              (err4) => {
                if (err4) {
                  return res.status(500).json(err4);
                }

                return res.json({
                  status: "Success",
                  MaDonHang,
                });
              },
            );
          });
        },
      );
    },
  );
});

app.put("/orders/cancel/:MaDonHang", (req, res) => {
  const { MaDonHang } = req.params;

  const sql = `
    UPDATE donhang
    SET TrangThai = 'DaHuy'
    WHERE MaDonHang = ? AND TrangThai = 'ChoXacNhan'
  `;

  db.query(sql, [MaDonHang], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Đơn hàng đã được xác nhận nên không thể hủy",
      });
    }

    return res.json({ status: "Success" });
  });
});

app.listen(5000, () => {
  console.log("Server đang chạy trên cổng 5000");
});
