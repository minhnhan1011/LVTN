# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY SOURCE CODE

## 1. Yêu cầu môi trường

Để chạy được hệ thống website, máy tính cần cài đặt các phần mềm sau:

* **Node.js**: dùng để chạy Back-end Node.js và cài đặt các thư viện cần thiết.
* **MySQL**: dùng để lưu trữ và quản lý cơ sở dữ liệu.
* **Visual Studio Code**: dùng để mở và chạy source code.
* **Trình duyệt Web**: Google Chrome, Microsoft Edge hoặc các trình duyệt tương đương.

## 2. Cài đặt cơ sở dữ liệu

Bước 1: Khởi động MySQL.

Bước 2: Tạo một cơ sở dữ liệu mới trong MySQL.

Bước 3: Import file `.sql` được cung cấp trong source code vào MySQL.

Có thể sử dụng MySQL Workbench hoặc phpMyAdmin để thực hiện import cơ sở dữ liệu.

Sau khi import thành công, kiểm tra các bảng dữ liệu đã được tạo đầy đủ.

Bước 4: Kiểm tra thông tin kết nối cơ sở dữ liệu trong source Back-end, bao gồm:

* Host
* User
* Password
* Database

Ví dụ:

```javascript
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "qlbangiay"
});
```

Thay đổi các thông tin trên cho phù hợp với cấu hình MySQL trên máy đang sử dụng.

## 3. Cài đặt và chạy Back-end

Bước 1: Mở thư mục Back-end bằng Visual Studio Code.

Bước 2: Mở Terminal trong Visual Studio Code.

Bước 3: Cài đặt các thư viện cần thiết bằng lệnh:

```bash
npm install
```

Lệnh trên sẽ tự động cài đặt các thư viện được khai báo trong file `package.json`.

Bước 4: Sau khi cài đặt hoàn tất, chạy Back-end bằng lệnh:

```bash
node server.js
```

Nếu dự án sử dụng `nodemon`, có thể chạy bằng:

```bash
npm start
```

hoặc:

```bash
npm run dev
```

tùy theo cấu hình trong file `package.json`.

Khi Terminal hiển thị thông báo Server đã chạy và kết nối MySQL thành công thì Back-end đã được khởi động.

## 4. Cài đặt và chạy Front-end

Bước 1: Mở thư mục Front-end bằng Visual Studio Code.

Bước 2: Mở Terminal tại thư mục Front-end.

Bước 3: Cài đặt các thư viện bằng lệnh:

```bash
npm install
```

Bước 4: Sau khi quá trình cài đặt hoàn tất, chạy Front-end bằng lệnh:

```bash
npm start
```

Nếu dự án được tạo bằng Vite thì sử dụng:

```bash
npm run dev
```

Sau khi chạy thành công, Terminal sẽ hiển thị địa chỉ website, ví dụ:

```text
http://localhost:3000
```

hoặc:

```text
http://localhost:5173
```

Mở địa chỉ được hiển thị trên trình duyệt để sử dụng website.

## 5. Thứ tự chạy chương trình

Để hệ thống hoạt động đúng, thực hiện theo thứ tự sau:

**Bước 1:** Khởi động MySQL.

**Bước 2:** Kiểm tra cơ sở dữ liệu đã được import.

**Bước 3:** Chạy Back-end Node.js.

**Bước 4:** Chạy Front-end ReactJS.

**Bước 5:** Truy cập đường dẫn localhost của Front-end trên trình duyệt.

## 6. Một số lỗi thường gặp

### Lỗi không kết nối được MySQL

Kiểm tra lại:

* MySQL đã được khởi động hay chưa.
* Tên database có chính xác hay không.
* User và Password MySQL.
* Cổng kết nối MySQL.

### Lỗi thiếu thư viện

Nếu xuất hiện lỗi liên quan đến package hoặc module, chạy lại:

```bash
npm install
```

tại đúng thư mục Front-end hoặc Back-end bị lỗi.

### Lỗi Front-end không gọi được Back-end

Kiểm tra Back-end đã được chạy hay chưa và kiểm tra địa chỉ API trong Front-end.

Ví dụ:

```javascript
http://localhost:5000
```

Cổng API phải trùng với cổng mà Back-end đang sử dụng.

### Lỗi cổng đã được sử dụng

Nếu xuất hiện thông báo cổng đang được sử dụng, cần tắt chương trình đang chiếm cổng đó hoặc thay đổi port của chương trình.

## 7. Hoàn tất

Sau khi Front-end, Back-end và MySQL đều hoạt động bình thường, người dùng có thể truy cập website thông qua trình duyệt và sử dụng các chức năng của hệ thống.
