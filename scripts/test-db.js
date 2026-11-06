const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Đang kiểm tra kết nối tới Supabase Database...");
  const users = await prisma.user.findMany();
  const logs = await prisma.readingLog.findMany();
  console.log(" Kết nối thành công tới Supabase!");
  console.log("Số lượng User hiện có trong Database:", users.length);
  console.log("Số lượng ReadingLog hiện có trong Database:", logs.length);
}

main()
  .catch((err) => {
    console.error(" Lỗi kết nối Database:", err.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

