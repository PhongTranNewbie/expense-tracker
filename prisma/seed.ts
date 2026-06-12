import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoryNames = [
  "Groceries",
  "Transport",
  "Utilities",
  "Dining",
  "Subscriptions",
  "Entertainment",
  "Health",
  "Shopping",
];

const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "PayPal",
  "Cash",
];

const demoUser = {
  email: "demo@example.com",
  name: "Demo User",
};

async function main() {
  console.log("Starting seed...");

  // Clear old demo data.
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();

  const user = await prisma.user.upsert({
    where: {
      email: demoUser.email,
    },
    update: {
      name: demoUser.name,
    },
    create: demoUser,
  });

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          userId: user.id,
        },
      })
    )
  );

  const expenses = [];
  const now = new Date();

  // Generate expenses for the last 4 months.
  for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
    const currentMonth = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset,
      1
    );

    const expenseCount = Math.floor(Math.random() * 6) + 10;

    for (let i = 0; i < expenseCount; i++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      const randomPaymentMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const randomDay = Math.floor(Math.random() * 28) + 1;

      const expenseDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        randomDay
      );

      expenses.push({
        amount: Number((Math.random() * 150 + 5).toFixed(2)),
        date: expenseDate,
        paymentMethod: randomPaymentMethod,
        categoryId: randomCategory.id,
        userId: user.id,
      });
    }
  }

  await prisma.expense.createMany({
    data: expenses,
  });

  console.log(`Seeded demo user: ${user.email}`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${expenses.length} expenses`);
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
