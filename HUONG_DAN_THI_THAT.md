# HƯỚNG DẪN THI THỰC HÀNH MÔN SDN302 - DỰ ÁN READLOG

Dự án này đã được hoàn thiện 100% theo đúng toàn bộ đặc tả của đề thi thật **ReadLog (FALL 2026)**.

---

## 1. THÔNG TIN DATABASE & MÔI TRƯỜNG (.env)
Dự án đã kết nối trực tiếp với Supabase PostgreSQL của bạn thông qua 3 biến môi trường trong file `.env`:
```env
DATABASE_URL="postgresql://postgres.azkfjtfebrbfliouxjxv:0377881961aA%40@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.azkfjtfebrbfliouxjxv:0377881961aA%40@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
AUTH_SECRET="sdn302-practical-exam-secret-key-2026-very-secure-at-least-32-chars"
```
> **Lưu ý:**
> - File `.env` chứa mật khẩu đã được bảo vệ trong `.gitignore`, không bao giờ được commit lên GitHub.
> - File `.env.example` liệt kê đúng 3 tên biến trên mà không có giá trị (đúng theo yêu cầu đề bài).

---

## 2. KIỂM TRA CHẠY LOCAL
Bạn có thể mở terminal và chạy:
```bash
npm run dev
```
Mở trình duyệt tại `http://localhost:3000`:
- **Đăng ký tài khoản** (`/register`): Báo `Registration successful`.
- **Đăng nhập** (`/login`): Tự động chuyển hướng sang `/reading-logs`.
- **Thêm phiên đọc sách**: Nhập book title, minutes read, genre, date -> Báo `Reading session added`.
- **Yêu thích (Favorite)**: Bấm nút tim để bật/tắt yêu thích (`aria-pressed` cập nhật true/false).
- **Bộ lọc & Tìm kiếm**: Lọc genre, check "Favorites only", tìm kiếm theo title hoặc note.
- **Thống kê (Reading Summary)**: Tự động cập nhật `reading-log-count`, `favorite-count`, `total-minutes` và `genre-breakdown`.
- **Xóa**: Bấm nút xóa để loại bỏ phiên đọc sách.

---

## 3. ĐẨY LÊN GITHUB & DEPLOY VERCEL

### A. Đẩy code lên GitHub:
```bash
git add .
git commit -m "Complete ReadLog SDN302 exam"
git push
```
Repository GitHub của bạn: **https://github.com/ThanhNam7791aaa/PE-SDN**

### B. Cấu hình trên Vercel:
1. Vào [vercel.com](https://vercel.com) -> Import repository `PE-SDN`.
2. Trong mục **Environment Variables**, điền đủ 3 biến môi trường từ file `.env`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
3. Bấm **Deploy**.
4. Vào **Settings** -> **Deployment Protection** -> Đảm bảo **Vercel Authentication** là **Disabled** (Tắt bảo vệ đăng nhập Vercel để hệ thống chấm thi tự động truy cập được).
5. Lấy đường link production (ví dụ `https://pe-sdn-xxx.vercel.app`).

---

## 4. TẠO TÀI KHOẢN CHO GIÁM THỊ (GRADER ACCOUNT)
> **Yêu cầu bắt buộc từ đề bài:**
> "Create one test account for the grader by registering it through your own app's Register page or API before you submit — do not create it directly in Supabase's dashboard, since the grader logs in through your app, not through Supabase."

1. Truy cập trang web đã deploy trên Vercel: `https://[your-project].vercel.app/register`.
2. Đăng ký tài khoản grader (ví dụ):
   - Email: `grader.qe123456@example.com`
   - Password: `Test1234!`
   *(Thay QE123456 bằng mã số sinh viên của bạn)*.
3. Đăng nhập thử bằng tài khoản này tại `/login` trên trang Vercel để đảm bảo hoạt động tốt.

---

## 5. ĐÓNG GÓI NỘP BÀI (SUBMISSION)
Tạo một thư mục đặt tên theo mã số sinh viên của bạn (ví dụ: `QE123456`), bên trong chứa đúng 2 file:

### File 1: `QE123456.docx`
Soạn file Word (.docx) theo đúng mẫu:
```
Student Code: QE123456
Full Name: Nguyen Van A
GitHub Repository URL: https://github.com/ThanhNam7791aaa/PE-SDN
Vercel Production URL: https://your-project.vercel.app
Test account email: grader.qe123456@example.com
Test account password: Test1234!
```
*(Thay thế thông tin bằng mã số SV, họ tên thật, URL Vercel của bạn và tài khoản grader đã tạo ở bước 4)*.

### File 2: `QE123456.zip`
Tạo file ZIP chứa toàn bộ mã nguồn sạch (không chứa `node_modules`, `.next`, `.git`, `.env`).
Bạn chỉ cần chạy lệnh sau trong terminal:
```bash
node scripts/pack-submission.js QE123456
```
*(Thay `QE123456` bằng mã số sinh viên của bạn. File ZIP chuẩn sẽ được tạo ra ngay lập tức!)*

---

## 6. DANH SÁCH TEST HOOKS (ĐÃ HOÀN TOÀN KHỚP VỚI ĐỀ BÀI)
| data-testid | Vị trí / Ý nghĩa |
|---|---|
| `btn-login`, `btn-register` | Header khi chưa đăng nhập |
| `user-email`, `btn-logout`, `link-reading-logs` | Header khi đã đăng nhập |
| `home-title` | Tiêu đề trang Home (text: `ReadLog`) |
| `login-form`, `login-email`, `login-password`, `login-submit` | Form đăng nhập |
| `register-form`, `register-email`, `register-password`, `register-confirm-password`, `register-submit` | Form đăng ký |
| `error-email`, `error-password`, `error-confirm-password`, `error-auth`, `form-success` | Các thông báo auth (chỉ render khi có lỗi/thành công) |
| `reading-logs-page` | Container trang Reading Logs |
| `reading-log-form`, `input-book-title`, `input-minutes`, `input-genre`, `input-note`, `input-date`, `btn-add-reading-log` | Form thêm phiên đọc |
| `error-book-title`, `error-minutes`, `error-genre`, `error-date`, `error-reading-log`, `reading-log-success` | Các thông báo của form (chỉ render khi có thông báo) |
| `reading-log-list`, `reading-log-item`, `reading-logs-empty` | Danh sách các phiên đọc sách |
| `reading-log-title`, `reading-log-minutes`, `reading-log-genre`, `reading-log-date`, `btn-toggle-favorite`, `btn-delete-reading-log` | Chi tiết trong từng dòng reading log |
| `filter-genre`, `filter-favorite`, `search-input`, `btn-clear-filters` | Bộ lọc, checkbox favorite, ô tìm kiếm và nút clear |
| `reading-log-count`, `favorite-count`, `total-minutes`, `genre-breakdown`, `breakdown-row`, `breakdown-name`, `breakdown-count`, `breakdown-total` | Thống kê số lượng, phút đọc và breakdown theo thể loại |
