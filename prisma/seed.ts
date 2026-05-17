import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.expense.deleteMany();

  const categories = [
    "Groceries",
    "Transport",
    "Utilities",
    "Dining",
    "Subscriptions",
    "Entertainment",
    "Health",
    "Shopping",
  ];
  const paymentMethods = ["Credit card", "Debit card", "Bank transfer", "PayPal", "Cash"];

  const expenses = [];
  const now = new Date();

  // Create data for the last 4 months
  for (let i = 0; i < 4; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);

    // Generate 10-15 expenses per month
    const count = Math.floor(Math.random() * 6) + 10;

    for (let j = 0; j < count; j++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(month.getFullYear(), month.getMonth(), day);

      expenses.push({
        category: categories[Math.floor(Math.random() * categories.length)],
        amount: parseFloat((Math.random() * 150 + 5).toFixed(2)),
        date: date,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      });
    }
  }

  for (const expense of expenses) {
    await prisma.expense.create({
      data: expense,
    });
  }

  console.log(`Seeded ${expenses.length} expenses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
