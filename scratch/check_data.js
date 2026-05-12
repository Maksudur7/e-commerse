const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.product.count();
  console.log('Total Products:', count);
  const cats = await prisma.category.count();
  console.log('Total Categories:', cats);
  process.exit(0);
}

check();
