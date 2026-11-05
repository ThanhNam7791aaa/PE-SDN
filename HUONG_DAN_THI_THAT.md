# HƯỚNG DẪN THI THỰC HÀNH MÔN SDN302 (FPT UNIVERSITY)

Dự án này đã được cài đặt và thiết lập sẵn sàng 100% theo chuẩn cấu trúc đề thi Practical Exam môn SDN302.
Khi vào phòng thi và nhận đề thi chính thức, bạn chỉ cần thực hiện theo các bước sau:

---

## 1. CÁC BIẾN MÔI TRƯỜNG CẦN THIẾT (.env)
Dự án sử dụng đúng 3 biến môi trường duy nhất (được khai báo mẫu tại `.env.example`):
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
AUTH_SECRET="chuoi-bi-mat-ngau-nhien-it-nhat-32-ky-tu-bat-ky-123456"
```
> **Lưu ý quan trọng từ đề thi:**
> - Tuyệt đối không commit file `.env` hoặc để lộ connection string lên GitHub hay file Word nộp bài.
> - File `.env.example` phải luôn có trong mã nguồn nộp (chỉ chứa tên biến, không chứa giá trị).

---

## 2. KẾT NỐI SUPABASE & CHẠY MIGRATION
1. Đăng nhập Supabase -> Tạo một Project mới (đặt tên ví dụ: `SDN302-QE123456`).
2. Vào **Project Settings** -> **Database**:
   - Sao chép **Session mode / Direct connection** (port 5432) vào `DIRECT_URL`.
   - Sao chép **Transaction mode / Connection Pooling** (port 6543) vào `DATABASE_URL`.
3. Tạo file `.env` ở thư mục gốc của dự án và điền 3 biến môi trường trên.
4. Chạy lệnh migrate để tạo bảng trên Supabase:
   ```bash
   npx prisma migrate dev --name init
   ```
   *(Hoặc `npx prisma migrate deploy` nếu đã có sẵn migration trong `prisma/migrations`)*

---

## 3. CHẠY VÀ KIỂM TRA TẠI LOCAL
- Khởi động môi trường dev:
  ```bash
  npm run dev
  ```
- Mở trình duyệt: `http://localhost:3000`
- Kiểm tra các chức năng:
  - Đăng ký tài khoản mới (`/register`) -> Thông báo `Registration successful`.
  - Đăng nhập (`/login`) -> Tự động chuyển sang `/expenses`.
  - Thêm chi tiêu, chỉnh sửa / bật tắt sao (star), lọc danh mục, tìm kiếm, xóa chi tiêu.
  - Xem thống kê spending summary (số lượng, tổng tiền, breakdown).

---

## 4. DEPLOY LÊN VERCEL
1. Tạo một repository mới trên GitHub (đặt ở chế độ **Public** theo yêu cầu đề bài) và đẩy code lên:
   ```bash
   git init
   git add .
   git commit -m "SDN302 Exam Project Initial Commit"
   git branch -M main
   git remote add origin https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) -> **Add New...** -> **Project** -> Import repository vừa tạo.
3. Trong phần **Environment Variables**, thêm đủ 3 biến:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
4. Bấm **Deploy**.
5. Sau khi deploy thành công:
   - Vào **Settings** -> **Deployment Protection** -> Đảm bảo **Vercel Authentication** đã tắt (**Disabled**).
   - Truy cập domain production chính thức: `https://[project-name].vercel.app`.

---

## 5. TẠO TÀI KHOẢN CHO GIÁM THỊ (GRADER ACCOUNT)
> **Yêu cầu bắt buộc từ đề bài:**
> "Create one test account for the grader by registering it through your own app's Register page or API before you submit — do not create it directly in Supabase's dashboard, since the grader logs in through your app, not through Supabase."
1. Mở trang web đã deploy trên Vercel: `https://[your-project].vercel.app/register`.
2. Đăng ký tài khoản grader (ví dụ):
   - Email: `grader.qe123456@example.com`
   - Password: `Test1234!`
3. Đăng nhập thử bằng tài khoản này tại trang `/login` trên Vercel để đảm bảo mọi thứ hoạt động trơn tru.

---

## 6. ĐÓNG GÓI BÀI THI ĐỂ NỘP
Tạo một thư mục đặt tên theo mã số sinh viên của bạn (ví dụ: `QE123456`), bên trong chứa đúng 2 file:

### File 1: `QE123456.docx`
Soạn một file Word (định dạng `.docx`) theo mẫu chuẩn sau:
```
Student Code: QE123456
Full Name: Nguyen Van A
GitHub Repository URL: https://github.com/username/repo-name
Vercel Production URL: https://your-project.vercel.app
Test account email: grader.qe123456@example.com
Test account password: Test1234!
```
*(Lưu ý: Không để chuỗi kết nối database hay mật khẩu Supabase trong file này).*

### File 2: `QE123456.zip`
File nén chứa toàn bộ mã nguồn của bạn.
- Cấu trúc: `package.json` phải nằm ngay tại thư mục gốc của file ZIP.
- **Bao gồm:** `package.json`, file lock, `app/`, `components/`, `context/`, `lib/`, `public/`, `components.json`, `prisma/schema.prisma`, `prisma/migrations/`, `.env.example`.
- **Tuyệt đối KHÔNG chứa:** `node_modules`, `.next`, `.git`, hoặc bất kỳ file `.env` chứa mật khẩu thật nào.

> **Mẹo đóng gói tự động:** Bạn có thể chạy lệnh sau trong terminal của dự án để tạo ngay file zip chuẩn:
> ```bash
> node scripts/pack-submission.js QE123456
> ```
> *(Thay QE123456 bằng mã số sinh viên của bạn).*

---

## 7. CHECKLIST TỰ KIỂM TRA TRƯỚC KHI NỘP (SELF-CHECK)
- [ ] Mở `/register` đăng ký thành công tài khoản mới. Đăng ký lại email đó hiển thị lỗi tại `error-auth`.
- [ ] Khi chưa đăng nhập, mở `/expenses` bị chuyển hướng ngay về `/login`.
- [ ] Đăng nhập thành công chuyển sang `/expenses`, header hiển thị email và nút Logout.
- [ ] Form thêm chi tiêu: submit form trống hiện đủ các câu thông báo lỗi; nhập số tiền âm báo lỗi; submit thành công hiển thị `Expense added` và chi tiêu xuất hiện ngay trên danh sách.
- [ ] Thêm chi tiêu trùng `title + amount + date` hiển thị thông báo lỗi `error-expense` (HTTP 409).
- [ ] Nút Toggle Star cập nhật `aria-pressed` đúng; khi bật "Starred only", bỏ sao một mục thì mục đó biến mất khỏi danh sách ngay lập tức.
- [ ] Bộ lọc Category, Starred-only, ô tìm kiếm Search hoạt động kết hợp mượt mà; bấm Clear reset cả 3.
- [ ] Thống kê spending summary (expense-count, starred-count, total-amount, category-breakdown) khớp chính xác với danh sách hiển thị.
- [ ] Xóa một mục hoạt động tức thì và giữ nguyên sau khi F5 tải lại trang.
- [ ] Gọi thử `GET /api/expenses` không có cookie trả về 401 Unauthorized.
- [ ] Lệnh `npm install && npm run build` chạy thành công không có lỗi.

