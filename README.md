"# MedicalSystem"

# Medical Booking API (Node.js Pure)

Hệ thống API đặt lịch khám bệnh được phát triển bằng Node.js thuần (không sử dụng framework như Express), kết nối cơ sở dữ liệu PostgreSQL.

## Live Demo

- API URL: https://medical-booking-api-rj8z.onrender.com
- Database: PostgreSQL (Render Hosted)

## Công nghệ sử dụng

- Backend: Node.js (HTTP Module thô, tự định nghĩa Router)
- Database: PostgreSQL (Thư viện `pg` với cơ chế Connection Pool)
- Authentication: JWT (JSON Web Token), mã hóa mật khẩu bằng `bcrypt`

## Danh sách Endpoints chính

### Authentication

- POST /auth/register - Đăng ký tài khoản mới
- POST /auth/login - Đăng nhập hệ thống (Trả về JWT Token)

### Appointments (Đặt lịch)

- GET /appointments - Lấy danh sách lịch hẹn
- POST /appointments - Tạo lịch hẹn mới

## Cách chạy dưới Local (Development)

1. Clone dự án về máy.
2. Cấu hình file `.env` ở thư mục gốc:

```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=medical_booking
   DB_USER=postgres
   DB_PASSWORD=your_password
   SECRET=your_jwt_secret
```
