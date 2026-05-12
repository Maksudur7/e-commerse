const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const cats = await prisma.category.count();
    const prods = await prisma.product.count();
    const catList = await prisma.category.findMany();
    console.log('Categories:', cats);
    console.log('Products:', prods);
    console.log('Category List:', catList);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
