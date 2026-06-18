"use client";

import { useState, useTransition } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/actions/categories";
import { CheckIcon, TrashIcon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startCreateTransition(async () => {
      try {
        const result = await createCategoryAction(newCategoryName);
        if (result.success && result.data) {
          setCategories([...categories, result.data]);
          setNewCategoryName("");
          toast.success("Category added");
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
          toast.success("Category updated");
        } else {
          toast.error(result.error || "Failed to update category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
      }
    });
  };

  const openDeleteConfirm = (id: string) => {
    setCategoryToDelete(id);
    setConfirmDialogOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    const id = categoryToDelete;
    setDeletingCategoryId(id);
    closeDeleteConfirm();
    
    startDeleteTransition(async () => {
      try {
        const result = await deleteCategoryAction(id);
        if (result.success) {
          setCategories(categories.filter(category => category.id !== id));
          toast.success("Category deleted");
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Organize expenses with categories you can reuse.
          </p>
        </div>
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="new-category-name">
            New category name
          </label>
          <Input
            id="new-category-name"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="w-full sm:w-56"
          />
          <Button
            type="submit"
            disabled={isPendingCreate}
            variant="primary"
            className="gap-1"
            aria-label={isPendingCreate ? "Adding category" : "Add category"}
          >
            <PlusIcon size={16} aria-hidden="true" />
            {isPendingCreate ? "Adding..." : "Add"}
          </Button>
        </form>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet. Create your first category above." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="flex items-center justify-between gap-3 p-4">
              {editingCategoryId === category.id ? (
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`edit-category-${category.id}`}>
                    Edit category name
                  </label>
                  <Input
                    id={`edit-category-${category.id}`}
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="w-full text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEditing(category.id);
                      } else if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Press Enter to save or Escape to cancel.
                  </p>
                </div>
              ) : (
                <span className="min-w-0 truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {category.name}
                </span>
              )}
              
              <div className="flex shrink-0 items-center gap-2">
                {editingCategoryId === category.id ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => saveEditing(category.id)}
                      disabled={isPendingUpdate || !editingCategoryName.trim()}
                      size="sm"
                      className="gap-1"
                    >
                      <CheckIcon size={14} aria-hidden="true" />
                      {isPendingUpdate ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelEditing}
                      disabled={isPendingUpdate}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(category)}
                    disabled={isPendingDelete || isPendingUpdate}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                    aria-label={`Edit ${category.name}`}
                    title="Edit category"
                  >
                    <PencilIcon size={16} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(category.id)}
                  disabled={isPendingDelete || isPendingUpdate}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  aria-label={`Delete ${category.name}`}
                  title="Delete category"
                >
                  {deletingCategoryId === category.id && isPendingDelete ? (
                    <span className="text-xs" aria-live="polite">...</span>
                  ) : (
                    <TrashIcon size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteCategory}
        title="Delete category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isPendingDelete}
        variant="danger"
      />
    </div>
  );
}
