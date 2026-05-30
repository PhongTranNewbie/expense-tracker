"use client";

import { useState, useTransition } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/actions/categories";
import { TrashIcon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

interface CategoriesClientViewProps {
  initialData: Category[];
}

export function CategoriesClientView({ initialData }: CategoriesClientViewProps) {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  
  const [isPendingCreate, startCreateTransition] = useTransition();
  const [isPendingUpdate, startUpdateTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startCreateTransition(async () => {
      try {
        const result = await createCategoryAction(newCategoryName);
        if (result.success && result.data) {
          setCategories([...categories, result.data]);
          setNewCategoryName("");
          toast.success("Category created successfully");
        } else {
          toast.error(result.error || "Failed to create category");
        }
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("Failed to create category");
      }
    });
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    startUpdateTransition(async () => {
      try {
        const result = await updateCategoryAction(id, name);
        if (result.success) {
          setCategories(categories.map(cat => cat.id === id ? { ...cat, name: name.trim() } : cat));
          setEditingCategoryId(null);
          setEditingCategoryName("");
          toast.success("Category updated successfully");
        } else {
          toast.error(result.error || "Failed to update category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
      }
    });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setDeletingCategoryId(id);
    startDeleteTransition(async () => {
      try {
        const result = await deleteCategoryAction(id);
        if (result.success) {
          setCategories(categories.filter(category => category.id !== id));
          toast.success("Category deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      } finally {
        setDeletingCategoryId(null);
      }
    });
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const saveEditing = async (id: string) => {
    await handleUpdateCategory(id, editingCategoryName);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Categories</h1>
        <form onSubmit={handleCreateCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPendingCreate}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <PlusIcon size={16} />
            {isPendingCreate ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No categories yet. Create your first category above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 flex items-center justify-between bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              {editingCategoryId === category.id ? (
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEditing(category.id);
                    } else if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                />
              ) : (
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{category.name}</span>
              )}
              
              <div className="flex items-center gap-3">
                {editingCategoryId === category.id ? (
                  <button
                    onClick={() => cancelEditing()}
                    disabled={isPendingUpdate}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPendingUpdate ? "Saving..." : "Cancel"}
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(category)}
                    disabled={isPendingDelete || isPendingUpdate}
                    className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit category"
                  >
                    <PencilIcon size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isPendingDelete || isPendingUpdate}
                  className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete category"
                >
                  {deletingCategoryId === category.id && isPendingDelete ? (
                    <span className="text-xs">Deleting...</span>
                  ) : (
                    <TrashIcon size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}