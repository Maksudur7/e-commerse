import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { user: true }
  });
  console.log('Total Orders in DB:', orders.length);
  orders.forEach(o => {
    console.log(`Order #${o.orderNumber} - User: ${o.user.email} (${o.userId}) - Amount: ${o.totalAmount}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
