"use client";

import { useState, useEffect, useCallback } from "react";
import { createCategory, getCategories, updateCategory, deleteCategory } from "@/app/actions/categories";
import { TrashIcon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const result = await createCategory(newCategoryName);
      if (result.success) {
        setCategories([...categories, result.data]);
        setNewCategoryName("");
        toast.success("Category created");
      } else {
        toast.error(result.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      const result = await updateCategory(id, name);
      if (result.success) {
        setCategories(categories.map(cat => cat.id === id ? { ...cat, name } : cat));
        setEditingCategoryId(null);
        setEditingCategoryName("");
        toast.success("Category updated");
      } else {
        toast.error(result.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter(category => category.id !== id));
        toast.success("Category deleted");
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <form onSubmit={handleCreateCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <PlusIcon size={16} />
            Add
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 flex items-center justify-between">
              {editingCategoryId === category.id ? (
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded"
                  onBlur={() => saveEditing(category.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEditing(category.id);
                    }
                  }}
                />
              ) : (
                <span className="font-medium">{category.name}</span>
              )}
              <div className="flex gap-2">
                {editingCategoryId === category.id ? (
                  <button
                    onClick={() => cancelEditing()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(category)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
