const REQUIRED_TEST_MARKER = "1";
const REQUIRED_TARGET = "migration-dev";
const REQUIRED_DISPOSABLE_CONFIRMATION = "YES";
const COMPOSITE_FOREIGN_KEY = "Expense_categoryId_userId_fkey";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getTestDatabaseUrl() {
  assert(
    process.env.POSTGRES_OWNERSHIP_TEST === REQUIRED_TEST_MARKER,
    "Refusing to run without POSTGRES_OWNERSHIP_TEST=1",
  );
  assert(
    process.env.POSTGRES_OWNERSHIP_TEST_TARGET === REQUIRED_TARGET,
    `Refusing to run unless POSTGRES_OWNERSHIP_TEST_TARGET=${REQUIRED_TARGET}`,
  );
  assert(
    process.env.POSTGRES_OWNERSHIP_TEST_CONFIRM_DISPOSABLE ===
      REQUIRED_DISPOSABLE_CONFIRMATION,
    "Refusing to run without explicit confirmation that the target is disposable",
  );

  const databaseUrl = process.env.POSTGRES_OWNERSHIP_TEST_DATABASE_URL;
  assert(
    databaseUrl,
    "POSTGRES_OWNERSHIP_TEST_DATABASE_URL is required; DATABASE_URL is not used as a fallback",
  );

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("POSTGRES_OWNERSHIP_TEST_DATABASE_URL is not a valid URL");
  }

  assert(
    parsedUrl.protocol === "postgresql:" || parsedUrl.protocol === "postgres:",
    "The ownership check requires a PostgreSQL URL",
  );
  assert(
    parsedUrl.hostname.endsWith(".neon.tech"),
    "The ownership check is restricted to an explicitly confirmed disposable Neon target",
  );
  assert(
    parsedUrl.searchParams.get("sslmode") === "require",
    "The ownership check requires sslmode=require",
  );

  return databaseUrl;
}

async function main() {
  const databaseUrl = getTestDatabaseUrl();

  // The application data layer uses the schema's DATABASE_URL. Set it only from
  // the dedicated test URL after all safety guards pass; never fall back to .env.
  process.env.DATABASE_URL = databaseUrl;
  process.env.DIRECT_URL = databaseUrl;

  const [{ prisma, Prisma }, { createExpense }] = await Promise.all([
    import("../lib/db"),
    import("../lib/expenses"),
  ]);

  const runId = `ownership-${crypto.randomUUID()}`;
  const userAId = `${runId}-user-a`;
  const userBId = `${runId}-user-b`;
  const categoryBId = `${runId}-category-b`;
  const invalidExpenseId = `${runId}-invalid-expense`;
  const validExpenseId = `${runId}-valid-expense`;
  const paymentMethod = `${runId}-test-payment`;

  try {
    await prisma.user.createMany({
      data: [
        {
          id: userAId,
          email: `${runId}-a@example.invalid`,
          name: "Ownership Check User A",
        },
        {
          id: userBId,
          email: `${runId}-b@example.invalid`,
          name: "Ownership Check User B",
        },
      ],
    });

    await prisma.category.create({
      data: {
        id: categoryBId,
        name: `${runId}-category`,
        userId: userBId,
      },
    });

    let applicationRejected = false;
    const originalConsoleError = console.error;
    try {
      console.error = () => {};
      await createExpense(userAId, {
        categoryId: categoryBId,
        amount: 10,
        date: new Date(),
        paymentMethod,
      });
    } catch (error) {
      applicationRejected =
        error instanceof Error && error.message === "Category not found";
    } finally {
      console.error = originalConsoleError;
    }

    assert(
      applicationRejected,
      "Application data layer did not reject another user's category",
    );

    let databaseRejectedCompositeForeignKey = false;
    try {
      await prisma.expense.create({
        data: {
          id: invalidExpenseId,
          amount: 20,
          date: new Date(),
          paymentMethod,
          categoryId: categoryBId,
          userId: userAId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        const constraintDetails = [
          error.meta?.field_name,
          error.meta?.constraint,
          error.message,
        ]
          .filter(Boolean)
          .join(" ");

        databaseRejectedCompositeForeignKey =
          constraintDetails.includes(COMPOSITE_FOREIGN_KEY);
      }
    }

    assert(
      databaseRejectedCompositeForeignKey,
      `PostgreSQL did not reject the mismatched ownership through ${COMPOSITE_FOREIGN_KEY}`,
    );

    const validExpense = await prisma.expense.create({
      data: {
        id: validExpenseId,
        amount: 30,
        date: new Date(),
        paymentMethod,
        categoryId: categoryBId,
        userId: userBId,
      },
    });

    assert(validExpense.id === validExpenseId, "Valid same-user expense was not created");
    assert(validExpense.userId === userBId, "Valid expense has the wrong owner");
    assert(validExpense.categoryId === categoryBId, "Valid expense has the wrong category");

    console.log("PostgreSQL ownership checks passed");
  } finally {
    await prisma.expense.deleteMany({
      where: {
        userId: { in: [userAId, userBId] },
        paymentMethod,
      },
    });
    await prisma.category.deleteMany({
      where: {
        id: categoryBId,
        userId: userBId,
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [userAId, userBId] },
      },
    });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Ownership check failed");
  process.exit(1);
});
