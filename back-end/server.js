const expess = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("796564877926-jseo3et4poimu4iuje2vufomeejdgse5.apps.googleusercontent.com");
const crypto = require("crypto");

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

app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: "796564877926-jseo3et4poimu4iuje2vufomeejdgse5.apps.googleusercontent.com",
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
          { expiresIn: "1h" }
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
            { expiresIn: "1h" }
          );

          res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
          });

          return res.json({
            status: "Success",
            user: newUser,
          });
        }
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
      return res.json({ status: "Fail", message: "Vui lòng nhập đúng định dạng email" });
    }

    if (MatKhau.length < 6) {
      return res.json({ status: "Fail", message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const sql = "INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro) VALUES (?, ?, ?, ?, 'Customer')";
    db.query(sql, [HoTen, Email, SoDienThoai, MatKhau], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ status: "Error" });
      }
      return res.json({ status: "Success" });
    });
  });
});

app.get("/admin/products", (req, res) => {
  const sql = `
    SELECT 
      sp.MaSanPham,
      sp.MaLoaiSanPham,
      sp.MaMauSac,
      sp.MaSize,
      lsp.TenSanPham,
      sp.DonGia,
      sp.SoLuong,
      ms.TenMauSac,
      sz.TenSize,
      th.TenThuongHieu
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp 
      ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN mausac ms 
      ON sp.MaMauSac = ms.MaMauSac
    LEFT JOIN size sz 
      ON sp.MaSize = sz.MaSize
    LEFT JOIN thuonghieu th 
      ON lsp.MaThuongHieu = th.MaThuongHieu
  `;

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/admin/products", (req, res) => {
  const sql = `
    INSERT INTO sanpham
    (MaSanPham, MaLoaiSanPham, MaMauSac, MaSize, DonGia, SoLuong)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.body.MaSanPham,
    req.body.MaLoaiSanPham,
    req.body.MaMauSac,
    req.body.MaSize,
    req.body.DonGia,
    req.body.SoLuong,
  ];

  db.query(sql, values, (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: "Success" });
  });
});

app.put("/admin/products/:id", (req, res) => {
  const sql = `
    UPDATE sanpham
    SET MaLoaiSanPham = ?,
        MaMauSac = ?,
        MaSize = ?,
        DonGia = ?,
        SoLuong = ?
    WHERE MaSanPham = ?
  `;

  const values = [
    req.body.MaLoaiSanPham,
    req.body.MaMauSac,
    req.body.MaSize,
    req.body.DonGia,
    req.body.SoLuong,
    req.params.id,
  ];

  db.query(sql, values, (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: "Success" });
  });
});

app.delete("/admin/products/:id", (req, res) => {
  const sql = "DELETE FROM sanpham WHERE MaSanPham = ?";

  db.query(sql, [req.params.id], (err, data) => {
    if (err) return res.json(err);
    return res.json({ status: "Success" });
  });
});

app.listen(5000, () => {
  console.log("Server đang chạy trên cổng 5000");
});
