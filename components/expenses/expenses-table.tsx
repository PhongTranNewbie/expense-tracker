export type ExpenseRow = {
  id: string;
  category: string;
  amount: string;
  date: string;
  paymentMethod: string;
};

type ExpensesTableProps = {
  expenses: ExpenseRow[];
  title?: string;
};

const th =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
const td =
  "px-4 py-3 text-sm text-zinc-800 tabular-nums dark:text-zinc-200";

export function ExpensesTable({
  expenses,
  title = "Recent expenses",
}: ExpensesTableProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>

      <ul className="space-y-3 sm:hidden">
        {expenses.map((row) => (
          <li
            key={row.id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {row.category}
              </p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {row.amount}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">
                  Date
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {row.date}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">
                  Payment
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {row.paymentMethod}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
                <th className={th}>Category</th>
                <th className={th}>Amount</th>
                <th className={th}>Date</th>
                <th className={th}>Payment method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {expenses.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className={`${td} font-medium`}>{row.category}</td>
                  <td className={td}>{row.amount}</td>
                  <td className={`${td} text-zinc-600 dark:text-zinc-400`}>
                    {row.date}
                  </td>
                  <td className={`${td} text-zinc-600 dark:text-zinc-400`}>
                    {row.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
