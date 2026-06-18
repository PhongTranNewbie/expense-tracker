import { copyFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";

type CdpClient = {
  send<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
  close(): void;
};

const appPort = Number(process.env.SMOKE_APP_PORT ?? 3020);
const debugPort = Number(process.env.SMOKE_DEBUG_PORT ?? 9320);
const appUrl = `http://localhost:${appPort}`;

function sqliteUrl(filePath: string) {
  const relativePath = path
    .relative(path.join(process.cwd(), "prisma"), filePath)
    .replace(/\\/g, "/");
  return `file:./${relativePath}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(
  check: () => Promise<boolean>,
  label: string,
  timeoutMs = 30_000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await check()) return;
    await wait(250);
  }

  throw new Error(`Timed out waiting for ${label}`);
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function spawnCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): ChildProcess {
  return spawn(command, args, {
    cwd: process.cwd(),
    env,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  const child = spawnCommand(command, args, env);
  let output = "";

  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
  });

  const code = await new Promise<number | null>((resolve) => {
    child.on("exit", resolve);
  });

  if (code !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${output}`);
  }
}

async function waitForServer() {
  await waitFor(async () => {
    try {
      const response = await fetch(`${appUrl}/login`);
      return response.ok;
    } catch {
      return false;
    }
  }, "Next dev server");
}

async function stopProcess(child: ReturnType<typeof spawn> | undefined) {
  if (!child || child.killed) return;
  if (child.exitCode !== null) return;

  await new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      }).once("exit", () => resolve());
    } else {
      child.kill();
    }
    setTimeout(resolve, 2_000);
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];

  return candidates.find((candidate) => {
    try {
      return require("node:fs").existsSync(candidate);
    } catch {
      return false;
    }
  });
}

async function connectCdp(webSocketUrl: string): Promise<CdpClient> {
  const socket = new WebSocket(webSocketUrl);

  await new Promise<void>((resolve, reject) => {
    socket.addEventListener("open", () => resolve(), { once: true });
    socket.addEventListener("error", () => reject(new Error("CDP connection failed")), {
      once: true,
    });
  });

  let id = 0;
  const pending = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
    }
  >();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data.toString());
    if (!message.id || !pending.has(message.id)) return;

    const request = pending.get(message.id)!;
    pending.delete(message.id);

    if (message.error) {
      request.reject(new Error(JSON.stringify(message.error)));
    } else {
      request.resolve(message.result);
    }
  });

  return {
    send<T = unknown>(method: string, params: Record<string, unknown> = {}) {
      const messageId = ++id;
      socket.send(JSON.stringify({ id: messageId, method, params }));

      return new Promise<T>((resolve, reject) => {
        pending.set(messageId, {
          resolve: (value) => resolve(value as T),
          reject,
        });
      });
    },
    close() {
      socket.close();
    },
  };
}

async function openBrowser(profileDir: string) {
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run browser smoke tests.");
  }

  const browser = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], {
    stdio: "ignore",
  });

  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      return response.ok;
    } catch {
      return false;
    }
  }, "browser debugging port");

  const tabs = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) =>
    response.json() as Promise<Array<{ type: string; webSocketDebuggerUrl: string }>>,
  );
  const tab = tabs.find((item) => item.type === "page") ?? tabs[0];
  const cdp = await connectCdp(tab.webSocketDebuggerUrl);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Input.setIgnoreInputEvents", { ignore: false });

  return { browser, cdp };
}

async function evaluate<T>(cdp: CdpClient, expression: string): Promise<T> {
  const result = await cdp.send<{
    result: { value: T };
    exceptionDetails?: unknown;
  }>("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }

  return result.result.value;
}

async function navigate(cdp: CdpClient, url: string) {
  await cdp.send("Page.navigate", { url });
  await wait(1_200);
}

async function setInput(cdp: CdpClient, selector: string, value: string) {
  const success = await evaluate<boolean>(
    cdp,
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`,
  );

  assert(success, `Unable to set input ${selector}`);
}

async function clickButton(cdp: CdpClient, label: string, root = "document") {
  const success = await evaluate<boolean>(
    cdp,
    `(() => {
      const root = ${root};
      const button = [...root.querySelectorAll("button")].find((item) => item.textContent.trim() === ${JSON.stringify(label)});
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );

  assert(success, `Unable to click button ${label}`);
}

async function createSession(prisma: PrismaClient, userId: string) {
  const token = `smoke-${crypto.randomUUID()}`;

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return token;
}

async function seedOwnershipData(prisma: PrismaClient) {
  const [firstUser, secondUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: "smoke-a@example.com",
        name: "Smoke A",
      },
    }),
    prisma.user.create({
      data: {
        email: "smoke-b@example.com",
        name: "Smoke B",
      },
    }),
  ]);

  const [firstCategory, secondCategory] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Food",
        userId: firstUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Travel",
        userId: secondUser.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.expense.create({
      data: {
        amount: 12,
        date: new Date("2026-06-01"),
        paymentMethod: "Cash",
        categoryId: firstCategory.id,
        userId: firstUser.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 34,
        date: new Date("2026-06-02"),
        paymentMethod: "Cash",
        categoryId: secondCategory.id,
        userId: secondUser.id,
      },
    }),
  ]);

  return {
    firstUser,
    secondUser,
    firstCategory,
    secondCategory,
  };
}

async function clearTestData(prisma: PrismaClient) {
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

async function testDataOwnership(prisma: PrismaClient) {
  const { getCategories } = await import("../lib/categories");
  const { createExpense, getExpenses } = await import("../lib/expenses");
  const seeded = await seedOwnershipData(prisma);

  const firstCategories = await getCategories(seeded.firstUser.id);
  const secondCategories = await getCategories(seeded.secondUser.id);
  const firstExpenses = await getExpenses(seeded.firstUser.id);
  const secondExpenses = await getExpenses(seeded.secondUser.id);

  assert(firstCategories.length === 1, "First user should read only their category");
  assert(firstCategories[0].id === seeded.firstCategory.id, "First user read another category");
  assert(secondCategories.length === 1, "Second user should read only their category");
  assert(secondCategories[0].id === seeded.secondCategory.id, "Second user read another category");
  assert(firstExpenses.length === 1, "First user should read only their expense");
  assert(firstExpenses[0].userId === seeded.firstUser.id, "First user read another expense");
  assert(secondExpenses.length === 1, "Second user should read only their expense");
  assert(secondExpenses[0].userId === seeded.secondUser.id, "Second user read another expense");

  let blockedCrossUserCategory = false;
  const originalConsoleError = console.error;
  try {
    console.error = () => {};
    await createExpense(seeded.firstUser.id, {
      categoryId: seeded.secondCategory.id,
      amount: 99,
      date: new Date("2026-06-03"),
      paymentMethod: "Cash",
    });
  } catch (error) {
    blockedCrossUserCategory =
      error instanceof Error && error.message.includes("Category not found");
  } finally {
    console.error = originalConsoleError;
  }

  assert(blockedCrossUserCategory, "Expense creation should reject another user's category");

  return seeded.firstUser.id;
}

async function testSignedOutRoutes() {
  const protectedRoutes = ["/", "/expenses", "/categories", "/reports", "/budgets", "/settings"];

  for (const route of protectedRoutes) {
    const response = await fetch(`${appUrl}${route}`, { redirect: "manual" });
    const body = await response.text();
    const location = response.headers.get("location") ?? "";
    const redirectedToLogin =
      (response.status >= 300 && response.status < 400 && location.includes("/login")) ||
      body.includes("NEXT_REDIRECT") ||
      body.includes("/login");

    assert(redirectedToLogin, `Signed-out user accessed protected route ${route}`);
  }
}

async function testExpenseCrudWithoutRefresh(cdp: CdpClient, sessionToken: string) {
  await cdp.send("Network.setCookie", {
    name: "authjs.session-token",
    value: sessionToken,
    url: appUrl,
    path: "/",
  });

  await navigate(cdp, `${appUrl}/expenses`);
  await waitFor(
    () =>
      evaluate<boolean>(
        cdp,
        `location.pathname === "/expenses" && document.body.innerText.includes("Add expense")`,
      ),
    "expenses page",
  );

  await clickButton(cdp, "Add expense");
  await waitFor(
    () => evaluate<boolean>(cdp, `!!document.querySelector("#expense-amount")`),
    "expense modal",
  );
  await setInput(cdp, "#expense-amount", "111.11");
  await setInput(cdp, "#expense-date", "2026-06-18");
  await setInput(cdp, "#expense-payment", "Cash");
  await clickButton(cdp, "Save expense");
  await waitFor(
    () => evaluate<boolean>(cdp, `document.body.innerText.includes("$111.11")`),
    "created expense row",
  );

  const clickedEdit = await evaluate<boolean>(
    cdp,
    `(() => {
      const row = [...document.querySelectorAll("tr")].find((item) => item.textContent.includes("$111.11"));
      const button = row ? [...row.querySelectorAll("button")].find((item) => item.textContent.trim() === "Edit") : null;
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
  assert(clickedEdit, "Unable to edit the newly created expense without refreshing");
  await waitFor(
    () => evaluate<boolean>(cdp, `document.querySelector("#expense-amount")?.value === "111.11"`),
    "edit expense modal",
  );
  await setInput(cdp, "#expense-amount", "222.22");
  await clickButton(cdp, "Update expense");
  await waitFor(
    () => evaluate<boolean>(cdp, `document.body.innerText.includes("$222.22")`),
    "updated expense row",
  );

  const clickedDelete = await evaluate<boolean>(
    cdp,
    `(() => {
      const row = [...document.querySelectorAll("tr")].find((item) => item.textContent.includes("$222.22"));
      const button = row ? [...row.querySelectorAll("button")].find((item) => item.textContent.trim() === "Delete") : null;
      if (!button) return false;
      button.click();
      return true;
    })()`,
  );
  assert(clickedDelete, "Unable to delete the newly updated expense without refreshing");
  await waitFor(
    () =>
      evaluate<boolean>(
        cdp,
        `document.querySelector('[role="dialog"]')?.innerText.includes("Delete expense")`,
      ),
    "delete confirmation dialog",
  );
  await clickButton(cdp, "Delete", `document.querySelector('[role="dialog"]')`);
  await waitFor(
    () => evaluate<boolean>(cdp, `!document.body.innerText.includes("$222.22")`),
    "deleted expense row",
  );
}

async function main() {
  const tempDir = await mkdtemp(path.join(process.cwd(), ".tmp-expense-smoke-"));
  const dbPath = path.join(tempDir, "smoke.db");
  const profileDir = path.join(tempDir, "chrome-profile");
  const databaseUrl = sqliteUrl(dbPath);
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: process.env.AUTH_SECRET ?? "smoke-test-secret",
    AUTH_URL: appUrl,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ?? "smoke-github-id",
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ?? "smoke-github-secret",
  };

  let server: ChildProcess | undefined;
  let serverOutput = "";
  let browser: ReturnType<typeof spawn> | undefined;
  let cdp: CdpClient | undefined;
  let prisma: PrismaClient | undefined;

  try {
    await copyFile(path.join(process.cwd(), "prisma", "dev.db"), dbPath);

    process.env.DATABASE_URL = databaseUrl;
    prisma = new PrismaClient();

    await clearTestData(prisma);

    const uiUserId = await testDataOwnership(prisma);
    const sessionToken = await createSession(prisma, uiUserId);

    server = spawnCommand("npx", ["next", "start", "-p", String(appPort)], env);
    server.stdout?.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });
    server.stderr?.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });

    try {
      await waitForServer();
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : error}\n${serverOutput}`);
    }

    await testSignedOutRoutes();

    const browserRuntime = await openBrowser(profileDir);
    browser = browserRuntime.browser;
    cdp = browserRuntime.cdp;
    await testExpenseCrudWithoutRefresh(cdp, sessionToken);

    console.log("Smoke tests passed:");
    console.log("- signed-out protected route redirects");
    console.log("- per-user category and expense reads");
    console.log("- cross-user category rejected for expense creation");
    console.log("- expense create -> edit -> delete without refresh");
  } finally {
    cdp?.close();
    await stopProcess(browser);
    await stopProcess(server);
    await prisma?.$disconnect();
    try {
      const db = await import("../lib/db");
      await db.prisma.$disconnect();
    } catch {
      // The lib Prisma singleton is only present after data-layer imports.
    }
    await wait(250);
    await rm(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
