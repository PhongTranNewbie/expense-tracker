import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureDefaultCategories, getCategories } from "@/lib/categories";
import { CategoriesClientView } from "@/components/categories/categories-client-view";

export const metadata = {
  title: "Manage Categories | MoneyVis",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  // Lấy dữ liệu trực tiếp từ DB ngay trên Server khi người dùng vừa tải trang
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  await ensureDefaultCategories(userId);

  const initialCategories = await getCategories(userId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Bắn dữ liệu thô xuống cho tầng giao diện Client nhào nặn */}
      <CategoriesClientView initialData={initialCategories} />
    </div>
  );
}
