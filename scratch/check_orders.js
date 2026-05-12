const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, email: true } } }
  });
  console.log('Total Orders in DB:', orders.length);
  orders.forEach((o) => {
    console.log(`Order #${o.orderNumber} | User: ${o.user?.email} | UserId: ${o.userId}`);
  });
}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());
