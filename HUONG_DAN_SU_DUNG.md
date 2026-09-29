# 🛡️ VIET AUTH SYSTEM - HỆ THỐNG QUẢN LÝ BẢN QUYỀN KEY & XÁC THỰC API TIẾNG VIỆT

Hệ thống Web Authentication & License Key Management được thiết kế chuyên biệt cho lập trình viên, nhà phát triển phần mềm, tool game và dịch vụ tại Việt Nam.

---

## 1. 🔍 ĐÁNH GIÁ & PHÂN TÍCH SOURCE CODE GỐC (DARK X AUTH)

Trong thư mục gốc `DARK X AUTH` của bạn gồm có:
- **`Setup.txt`**: Tài liệu của nhà phát triển Anupam Thakur, kết nối tới dịch vụ gốc `https://auth.darkxnet.online/api/1.2/`.
- **`dark-x-auth/`**: Một ứng dụng Android hoàn chỉnh viết bằng **Kotlin + Jetpack Compose**, sử dụng thư viện:
  - `Retrofit` & `OkHttp`: Kết nối tới REST API của server.
  - `Room Database`: Bộ nhớ đệm SQLite cục bộ trên điện thoại.
  - `Moshi`: Parser JSON chuyển đổi dữ liệu.
  - Giao diện Dark Cyberpunk cực kỳ bắt mắt với các màn hình: Dashboard thống kê, Quản lý Apps, Danh sách Key (Licenses), Reset HWID, Quản lý người dùng, Biến từ xa và Quản trị Session.
  - Hệ thống xác thực bằng Cookie phiên: `ax9_session`.

Nhược điểm của source gốc: Backend nằm trên server nước ngoài (`darkxnet.online`), phụ thuộc vào đường truyền quốc tế và không có mã nguồn server riêng để tự lưu trữ và quản lý key tại Việt Nam.

---

## 2. 🚀 GIỚI THIỆU HỆ THỐNG WEB AUTH MỚI (VIET_AUTH_WEB)

Chúng tôi đã xây dựng riêng cho bạn một hệ thống **Web Quản Trị Bản Quyền & REST API Server 100% Tiếng Việt**, chạy độc lập trên máy tính của bạn:

### 🌟 Ưu điểm nổi bật:
1. **Không cần cài đặt Node.js hay Python**: Server được lập trình bằng **PowerShell .NET HttpListener**, tích hợp sẵn trên mọi máy tính Windows!
2. **Giao diện Web Cyber Dark Glassmorphism**: Thiết kế cao cấp, có hiệu ứng phát sáng Neon, thẻ kính mờ, micro-animations và 100% tiếng Việt.
3. **Chạy Dual-Mode (Trực Tuyến & Cục Bộ)**:
   - Khi bật server (`start-server.bat`): Hệ thống đồng bộ dữ liệu vào file `data/database.json`.
   - Khi mở trực tiếp file `index.html`: Hệ thống tự động chuyển sang chế độ LocalStorage Cache, dùng thử mượt mà không cần mạng.
4. **Đầy đủ tính năng KeyAuth chuyên nghiệp**:
   - Quản lý ứng dụng (Tạo App, cấp `App ID`, `Secret Key`).
   - Tạo key đơn lẻ hoặc hàng loạt (1 đến 100 key cùng lúc).
   - Tùy chỉnh tiền tố key (ví dụ: `VIET-VIP-XXXX-XXXX-XXXX`).
   - Cấp bậc bản quyền: VIP, PRO, BASIC, ENTERPRISE.
   - Thời hạn đa dạng: 1 ngày (dùng thử), 7 ngày, 30 ngày, 90 ngày, 365 ngày và **Vĩnh Viễn (Lifetime)**.
   - Khóa phần cứng **HWID (Hardware ID)**: Chống chia sẻ key trái phép giữa các máy.
   - Nút **Đặt lại HWID (Reset HWID)**: Hỗ trợ khách đổi máy tính mới chỉ với 1 click.
   - Khóa key (Ban) có kèm lý do, Mở khóa (Unban), Gia hạn thêm ngày (Add Days).
   - Xuất danh sách key ra file `.txt` chỉ bằng 1 nút bấm.
   - Công cụ **Test API Trực Tiếp (Live Playground)** ngay trên web, kiểm tra phản hồi JSON và độ trễ (ping ms).

---

## 3. 💻 HƯỚNG DẪN KHỞI CHẠY (1-CLICK)

### Cách 1: Khởi chạy đầy đủ Server & Web (Khuyên dùng)
1. Mở thư mục: `VIET_AUTH_WEB`
2. Nhấp đúp vào file: **`start-server.bat`**
3. Cửa sổ máy chủ sẽ mở ra và tự động bật trình duyệt web tại địa chỉ:
   ```
   http://localhost:8080/
   ```
4. Dữ liệu tạo key, ứng dụng, biến sẽ tự động được lưu vào `data/database.json`.

### Cách 2: Mở nhanh trực tiếp trên trình duyệt
1. Nhấp đúp trực tiếp vào file **`index.html`** bằng trình duyệt bất kỳ (Google Chrome, Microsoft Edge, Cốc Cốc,...).
2. Hệ thống sẽ hoạt động ở chế độ cục bộ Offline siêu mượt!

---

## 4. 📡 TÀI LIỆU REST API (DÀNH CHO LẬP TRÌNH VIÊN)

### 4.1. Xác thực bản quyền Key (Verify License)
- **URL**: `http://localhost:8080/api/1.2/license/verify`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "license": "VIET-VIP-8888-9999-AAAA",
  "hwid": "HWID-PC-VIETNAM-882194",
  "appId": "app_pk_viet_9a8b7c6d5e4f"
}
```
- **Phản hồi thành công (200 OK)**:
```json
{
  "success": true,
  "message": "Xác thực bản quyền thành công!",
  "data": {
    "key": "VIET-VIP-8888-9999-AAAA",
    "status": "ACTIVE",
    "subscriptionLevel": "VIP",
    "isLifetime": false,
    "expiresAt": "2026-10-25T09:30:00Z",
    "daysRemaining": 26,
    "hwid": "HWID-PC-VIETNAM-882194"
  }
}
```

### 4.2. Kiểm tra máy chủ (Ping / Health Check)
- **URL**: `http://localhost:8080/api/1.2/status`
- **Method**: `GET`
- **Phản hồi**:
```json
{
  "status": "operational",
  "service": "VIET AUTH SYSTEM",
  "version": "1.2",
  "timestamp": 1793200000
}
```

### 4.3. Lấy biến từ xa (Get Remote Variable)
- **URL**: `http://localhost:8080/api/1.2/variable?name=APP_VERSION`
- **Method**: `GET`
- **Phản hồi**:
```json
{
  "success": true,
  "name": "APP_VERSION",
  "value": "2.5.0"
}
```

---

## 5. ⚡ CHUẨN CLIENT API TƯƠNG THÍCH KEYAUTH & LONGAUTH (`/api/v1/client/*`)

Hệ thống hỗ trợ 100% chuẩn kết nối của **KeyAuth** và **LongAuth (longauth.site)**. Bạn chỉ cần thả file `auth.hpp` vào project C++ và sử dụng:

```cpp
#include "auth.hpp"

// Khởi tạo đối tượng KeyAuthApp:
// name    = Tên hiển thị của Tool/App (vd: "Tool VIP Pro Auto 2026")
// ownerid = VietAuth App ID (vd: "app_pk_viet_9a8b7c6d5e4f")
// version = Phiên bản ứng dụng (vd: "2.5.0")
// url     = URL máy chủ (vd: "http://localhost:8080" hoặc domain Render "https://your-app.onrender.com")
// path    = VietAuth App Secret Key (vd: "sk_live_viet_849203847291039482")
KeyAuth::api KeyAuthApp(name, ownerid, version, url, path);
```

### 📡 Danh Sách Endpoints Chuẩn LongAuth / KeyAuth:

1. **Khởi tạo ứng dụng (Init)**:
   - `POST /api/v1/client/init`
   - Headers: `x-app-id`, `x-timestamp`, `x-nonce`, `x-signature`
   - Trả về: `numOnlineUsers`, `numUsers`, `numKeys`, `version`, `token`.

2. **Đăng nhập bằng mã Key (License Login)**:
   - `POST /api/v1/client/login`
   - Body: `{"key": "VIET-VIP-8888-9999-AAAA", "hwid": "HWID-PC-..."}`
   - Trả về: `token`, `expiresAt` (ISO UTC), `subscription`, `numOnlineUsers`.

3. **Đăng nhập bằng Tài khoản (User Login)**:
   - `POST /api/v1/client/login-user`
   - Body: `{"username": "...", "password": "...", "hwid": "..."}`

4. **Đăng ký tài khoản mới kèm Key (Register)**:
   - `POST /api/v1/client/register`
   - Body: `{"username": "...", "password": "...", "key": "...", "hwid": "..."}`

5. **Duy trì phiên & Kiểm tra Heartbeat (Check Session)**:
   - `POST /api/v1/client/check` (hoặc `GET`)
   - Tự động cập nhật thời gian hoạt động của máy, trả về `numOnlineUsers`.

6. **Lấy danh sách biến ứng dụng (Variables)**:
   - `GET /api/v1/client/variables`

### 🛠️ Hướng Dẫn Biên Dịch C++ Client:
- **Yêu cầu thư viện**: `libcurl` và `OpenSSL` (libcrypto).
- **MinGW / GCC**:
  ```bash
  g++ main.cpp -lcurl -lcrypto -o app.exe
  ```
- **Visual Studio C++**:
  - Properties -> C/C++ -> General -> Additional Include Directories: trỏ tới include của curl & openssl.
  - Linker -> Input -> Additional Dependencies: thêm `libcurl.lib` và `libcrypto.lib`.

---

## 6. 🖥️ QUẢN LÝ SỐ MÁY TRUY CẬP (ONLINE DEVICES / SESSIONS)

Hệ thống tự động theo dõi thời gian thực số lượng máy tính và thiết bị đang kết nối tới từng ứng dụng:

- **Cơ chế nhận diện máy**:
  - Dựa trên mã phần cứng **HWID** và địa chỉ **IP**.
  - Mỗi khi máy client gọi API (`init`, `login`, `verify`, `check`), hệ thống tự động ghi nhận máy ở trạng thái `ONLINE`.
  - Nếu máy không gửi tín hiệu trong **15 phút**, trạng thái tự động chuyển thành `OFFLINE`.
- **Hiển thị trực quan**:
  - **Chấm xanh Neon nhấp nháy (`🟢`)**: Xuất hiện trên từng thẻ ứng dụng hiển thị số máy đang online của riêng app đó.
  - **Bảng danh sách máy đang truy cập**: Xem chi tiết tên máy/HWID, IP mạng, ứng dụng đang chạy, key đã kích hoạt, thời gian kết nối lần đầu và lần cuối.
  - **Nút Ngắt Kết Nối (Disconnect)**: Cho phép admin hoặc chủ app đá máy ra khỏi hệ thống nếu nghi ngờ gian lận.

---

## 7. 📥 TỰ ĐỘNG TẢI SDK VỀ MÁY (1-CLICK AUTO DOWNLOAD)

Bạn không cần phải tự sửa code hay copy paste thủ công! Hệ thống đã tích hợp tính năng **Tự động sinh mã nguồn kèm khóa bí mật**:

1. **Tải từ Thẻ Ứng Dụng**:
   - Vào mục **"Ứng Dụng Của Tôi"**.
   - Dưới mỗi app có sẵn 4 nút tải nhanh:
     - `📥 Tải auth.hpp (C++)`: Header tương thích KeyAuth & LongAuth.
     - `📥 Tải main.cpp (C++)`: Chương trình C++ mẫu đã điền sẵn `App ID`, `Secret Key`, `App Name`, `Base URL`.
     - `📥 Tải C# (.NET)`: Class `VietAuthClient.cs` cho WinForms / WPF.
     - `📥 Tải Python`: Script `viet_auth_client.py` sẵn sàng chạy ngay.
2. **Tải từ Khu Vực Code Snippet / Test API**:
   - Chọn tab ngôn ngữ bạn muốn (`auth.hpp`, `main.cpp`, `C#`, `Python`).
   - Bấm nút **"📥 Tải File Về Máy"** để lưu file code về máy tính chỉ trong 1 giây.

---

## 8. 📂 DANH MỤC FILE TRONG DỰ ÁN

```
VIET_AUTH_WEB/
├── index.html                  # Giao diện Web SPA Cyber Dark tiếng Việt
├── style.css                   # Hệ thống Style Glassmorphism & Neon Glow
├── app.js                      # Logic điều khiển, sinh key, gọi API, theo dõi máy, tải SDK
├── server.js                   # Backend Node.js native (Sẵn sàng 100% cho Render.com)
├── server.ps1                  # Backend REST API Server bằng PowerShell (.NET)
├── start-server.bat            # File 1-click khởi chạy Server trên Windows
├── data/
│   └── database.json           # Cơ sở dữ liệu JSON tự động lưu (kèm quản lý devices)
├── clients/
│   ├── auth.hpp                # Header C++ tương thích LongAuth/KeyAuth
│   ├── main.cpp                # Code mẫu C++ chạy thử nghiệm xác thực key
│   ├── VietAuthClient.cs       # Code mẫu tích hợp C# (.NET WinForms)
│   └── viet_auth_client.py     # Code mẫu tích hợp Python 3
├── HUONG_DAN_RENDER.md         # Hướng dẫn deploy 1-click lên Render.com miễn phí
└── HUONG_DAN_SU_DUNG.md        # File tài liệu hướng dẫn đầy đủ này
```

---

## 9. 👥 PHÂN QUYỀN THÀNH VIÊN (MEMBER) & QUẢN TRỊ VIÊN (MASTER ADMIN)

Hệ thống được thiết kế theo đúng mô hình KeyAuth chuyên nghiệp:

### 👤 Thành Viên (Member):
- **Trang Cá Nhân**: Xem thông tin tài khoản, HWID máy, danh sách key bản quyền đã kích hoạt.
- **Theo Dõi Thiết Bị**: Xem số máy đang online của các ứng dụng do mình tạo và danh sách thiết bị.
- **Ứng Dụng Của Tôi**: Tạo ứng dụng mới, lấy `App ID` (Public Key) và `Secret Key` để liên kết API vào tool/phần mềm.
- **Tải SDK Tự Động**: Tải file `auth.hpp`, `main.cpp`, `C#`, `Python` đã điền sẵn thông tin app của mình.
- **Quản Lý & Tạo Key**: Tự tạo mã key bản quyền (VIP, PRO, 1 ngày, 7 ngày, 30 ngày, vĩnh viễn), sao chép key, reset HWID cho khách khi đổi máy.
- **Kích Hoạt Key**: Nhập mã key để bind vào tài khoản.
- **Tài Liệu & Test API**: Sử dụng Playground để test API và tải code mẫu C#, Python, C++.

### 👑 Quản Trị Viên Cấp Cao (Master Admin):
- Bấm vào mục **🛡️ Quản Lý Hệ Thống** trên menu hoặc góc trên bên phải.
- Nhập mã bí mật: `thai` (Giao diện hoàn toàn bảo mật, không hiển thị chữ "thai" ra ngoài).
- Sau khi mở khóa, thanh menu sẽ hiển thị khu vực quản trị tối cao:
  1. **Tổng Quan Hệ Thống**: Thống kê toàn server (Bao gồm số máy đang online), tra cứu key nhanh, nhật ký gần đây.
  2. **Quản Lý Thiết Bị Toàn Server**: Xem và ngắt kết nối bất kỳ máy tính nào.
  3. **Quản Lý Thành Viên**: Xem mọi tài khoản, khóa / mở khóa tài khoản, xóa user.
  4. **Biến Cấu Hình Từ Xa**: Thêm, sửa, xóa biến server (link update, bảo trì).
  5. **Nhật Ký Hoạt Động**: Toàn bộ nhật ký audit log của server.
  6. **Khóa / Thoát Quyền Admin**: Khóa bảo vệ quyền quản trị sau khi thao tác xong.

