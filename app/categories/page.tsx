import { getCategories } from "@/lib/categories";
import { CategoriesClientView } from "./categories-client";

export const metadata = {
  title: "Manage Categories | MoneyVis",
};

export default async function CategoriesPage() {
  // Lấy dữ liệu trực tiếp từ DB ngay trên Server khi người dùng vừa tải trang
  const initialCategories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Bắn dữ liệu thô xuống cho tầng giao diện Client nhào nặn */}
      <CategoriesClientView initialData={initialCategories} />
    </div>
  );
}