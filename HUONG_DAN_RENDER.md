# 🚀 HƯỚNG DẪN ĐƯA VIET AUTH LÊN RENDER.COM (100% MIỄN PHÍ)

Hệ thống đã được tối ưu hóa sẵn sàng để deploy lên **Render.com** chỉ với 3 bước đơn giản.

---

## 🔑 THÔNG TIN BẢO MẬT HỆ THỐNG
- **Key Admin mở khóa toàn quyền**: `thai`
- **Tài khoản mẫu**: `nguyenvana` / mật khẩu `123`

---

## 🛠️ CÁC BƯỚC ĐƯA LÊN RENDER.COM

### Bước 1: Đưa Code Lên GitHub
1. Tạo một repository mới trên GitHub (ví dụ đặt tên: `viet-auth-system`).
2. Mở Terminal / CMD tại thư mục dự án và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao VietAuth System"
   git branch -M main
   git remote add origin https://github.com/TEN_GITHUB_CUA_BAN/viet-auth-system.git
   git push -u origin main
   ```
*(Lưu ý: Thư mục đã có sẵn file `.gitignore` tự động loại bỏ các file nặng, giúp việc upload lên GitHub chỉ mất vài giây).*

---

### Bước 2: Tạo Web Service Trên Render.com
1. Truy cập [https://render.com](https://render.com) và đăng nhập (bằng tài khoản GitHub).
2. Bấm vào nút **New +** ở góc trên bên phải, chọn **Web Service**.
3. Chọn repository GitHub `viet-auth-system` mà bạn vừa tạo ở Bước 1.
4. Điền các thông số như sau:
   - **Name**: `viet-auth-system` (hoặc tên tùy thích của bạn)
   - **Region**: Singapore (hoặc Oregon/Frankfurt)
   - **Language / Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: `VIET_AUTH_WEB` (hoặc để trống nếu deploy cả repo)
   - **Build Command**: để trống (không cần build)
   - **Start Command**: `node server.js` (hoặc `npm start`)
   - **Instance Type**: `Free` (Miễn phí)
5. Bấm **Create Web Service**.

---

### Bước 3: Hoàn Tất & Sử Dụng
- Render sẽ tự động cài đặt và khởi chạy máy chủ trong khoảng 30 giây - 1 phút.
- Sau khi xong, Render sẽ cấp cho bạn một đường link công khai miễn phí dạng:
  ```
  https://viet-auth-system.onrender.com
  ```
- Bạn có thể truy cập link trên bất kỳ đâu (điện thoại, máy tính, VPS).
- Dùng link này để tích hợp trực tiếp vào Tool C#, Python, C++:
  - API Xác thực: `https://viet-auth-system.onrender.com/api/1.2/license/verify`
  - API Health: `https://viet-auth-system.onrender.com/api/1.2/status`
  - Bấm vào mục **"Quản Lý (Admin)"** và nhập mã: **`thai`** để vào Bảng Quản Trị toàn quyền!
