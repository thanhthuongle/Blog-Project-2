# Dự Án Blog chia sẻ kiến thức cộng đồng

## Giới Thiệu
Blog chia sẻ kiến thức cộng đồng là một website cung cấp kiến thức trực tuyến do các thành viên đóng góp trên mọi lĩnh vực khoa học, đời sống, giải trí … Các đóng góp đều được đội ngũ kiểm duyệt của website chọn lọc, hứa hẹn sẽ mang đến những bài viết chất lượng đến mọi bạn đọc. 
## Tính Năng
- Xác thực người dùng (đăng ký, đăng nhập, đăng xuất)
- Tạo, chỉnh sửa và xóa bài viết blog
- Xem các bài viết blog
- Bình luận trên các bài viết blog

## Cấu Trúc Dự Án
Web-Blog-Project-2/
│
├── .git/ # Kho Git
├── src/ # Mã nguồn
│ ├── components/ # Các thành phần React
│ ├── pages/ # Các trang
│ ├── App.js # Thành phần ứng dụng chính
│ ├── index.js # Điểm bắt đầu
│ └── ... # Các tệp nguồn khác
├── public/ # Tài sản công khai
│ ├── index.html # Mẫu HTML
│ └── ... # Các tài sản công khai khác
├── package.json # Metadata và các phụ thuộc của dự án
├── README.md # Tài liệu dự án
└── ... # Các tệp dự án khác

## Cài Đặt

1. **Clone kho lưu trữ**
    ```sh
    git clone https://github.com/thanhthuongle/Blog-Project-2.git
    cd Web-Blog-Project-2
    ```

2. **Cài đặt các phụ thuộc**
    ```sh
    npm install
    ```

3. **Khởi động server phát triển**
    ```sh
    npm start
    ```

    Ứng dụng sẽ được chạy tại `http://localhost:3000`.

## Sử Dụng

1. **Đăng ký** tài khoản mới.
2. **Đăng nhập** bằng thông tin tài khoản của bạn.
3. **Tạo bài viết blog mới** bằng cách điều hướng đến trang "Tạo bài viết".
4. **Xem các bài viết blog** trên trang chủ.
5. **Chỉnh sửa hoặc xóa** các bài viết blog của bạn khi cần.