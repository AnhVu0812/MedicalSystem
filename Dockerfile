#Dockerfile
# Bước 1: Mượn một cái máy tính mini đã cài sẵn Node.js bản 20 hệ điều hành Linux (Alpine là bản siêu nhẹ)
FROM node:20-alpine

# Bước 2: Tạo một thư mục tên là /app bên trong cái máy tính mini đó để chứa code của mình
WORKDIR /app

# Bước 3: Copy file quản lý thư viện từ máy thật vào trong cái máy tính mini
COPY package*.json ./

# Bước 4: Chạy lệnh cài đặt các thư viện (như pg, bcrypt, jsonwebtoken...) bên trong máy tính mini
RUN npm install

# Bước 5: Cài xong thư viện thì copy toàn bộ code còn lại từ máy thật vào máy tính mini
COPY . .

# Bước 6: Khai báo rằng con app của tôi trong máy tính mini này sẽ phát tín hiệu ra cổng 3000
EXPOSE 3000

# Bước 7: Câu lệnh cuối cùng để kích hoạt con app chạy (tương đương lệnh node index.js ở máy thật)
CMD ["node", "server.js"]