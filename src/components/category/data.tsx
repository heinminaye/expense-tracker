import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiChevronDown,
  FiChevronRight,
  FiSave,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import { 
  addCategory, 
  fetchCategories, 
  updateCategory, 
  deleteCategory as deleteCategoryApi 
} from "../../libs/api";
import useStore from "../../store";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
  isExpanded?: boolean;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingMainCategory, setIsAddingMainCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addingSubcategoryFor, setAddingSubcategoryFor] = useState<string | null>(null);
  const { user } = useStore.getState();

  // API Calls
  const api = {
    fetchCategories: async () => {
      setIsLoading(true);
      try {
        const response = await fetchCategories({ user_id: user });
        if (response.returncode === "200") {
          const categoriesWithExpanded = response.data.map(cat => ({
            ...cat,
            isExpanded: false,
            children: cat.children ? cat.children.map(child => ({ 
              ...child, 
              isExpanded: false,
              children: [] // Ensure no deeper levels exist
            })) : undefined
          }));
          setCategories(categoriesWithExpanded);
        } else {
          toast.error(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to connect to the server");
      } finally {
        setIsLoading(false);
      }
    },

    addCategory: async (name: string, parentId: string | null) => {
      setIsLoading(true);
      try {
        // Prevent adding sub-subcategories
        if (parentId) {
          const parentCategory = categoryTree.findCategory(parentId, categories);
          if (parentCategory?.parentId) {
            toast.error("Cannot add subcategories to subcategories");
            return null;
          }
        }

        const response = await addCategory({
          user_id: user,
          name: name.trim(),
          parentId
        });

        if (response.returncode === "200") {
          toast.success(response.message);
          return {
            ...response.data,
            isExpanded: true,
            children: []
          };
        } else {
          toast.error(response.message || "Failed to add category");
          return null;
        }
      } catch (err) {
        console.error("Error adding category:", err);
        toast.error("Failed to connect to the server");
        return null;
      } finally {
        setIsLoading(false);
      }
    },

    updateCategory: async (id: string, name: string) => {
      setIsLoading(true);
      try {
        const response = await updateCategory({
          user_id: user,
          category_id: id,
          name: name.trim()
        });

        if (response.returncode === "200") {
          toast.success(response.message);
          return true;
        } else {
          toast.error(response.message || "Failed to update category");
          return false;
        }
      } catch (err) {
        console.error("Error updating category:", err);
        toast.error("Failed to connect to the server");
        return false;
      } finally {
        setIsLoading(false);
      }
    },

    deleteCategory: async (id: string) => {
      setIsLoading(true);
      try {
        const response = await deleteCategoryApi({
          user_id: user,
          category_id: id
        });

        if (response.returncode === "200") {
          toast.success(response.message);
          return true;
        } else {
          toast.error(response.message || "Failed to delete category");
          return false;
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        toast.error("Failed to connect to the server");
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    api.fetchCategories();
  }, []);

  // Category Tree Operations
  const categoryTree = {
    toggleExpand: (id: string) => {
      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          isExpanded: cat.id === id ? !cat.isExpanded : cat.isExpanded,
          children: cat.children ? categoryTree.toggleExpandInChildren(cat.children, id) : undefined
        }))
      );
    },

    toggleExpandInChildren: (children: Category[], id: string): Category[] => {
      return children.map(child => ({
        ...child,
        isExpanded: child.id === id ? !child.isExpanded : child.isExpanded,
        children: child.children ? categoryTree.toggleExpandInChildren(child.children, id) : undefined
      }));
    },

    findCategory: (id: string, categoryList: Category[]): Category | null => {
      for (const category of categoryList) {
        if (category.id === id) return category;
        if (category.children) {
          const found = categoryTree.findCategory(id, category.children);
          if (found) return found;
        }
      }
      return null;
    },

    updateCategoryInTree: (categories: Category[], id: string, updates: Partial<Category>): Category[] => {
      return categories.map(cat => {
        if (cat.id === id) return { ...cat, ...updates };
        if (cat.children) {
          return {
            ...cat,
            children: categoryTree.updateCategoryInTree(cat.children, id, updates)
          };
        }
        return cat;
      });
    },

    addSubcategoryToTree: (categories: Category[], parentId: string, newCategory: Category): Category[] => {
      return categories.map(cat => {
        if (cat.id === parentId) {
          return {
            ...cat,
            children: [...(cat.children || []), newCategory],
            isExpanded: true
          };
        }
        if (cat.children) {
          return {
            ...cat,
            children: categoryTree.addSubcategoryToTree(cat.children, parentId, newCategory)
          };
        }
        return cat;
      });
    },

    removeCategoryFromTree: (categories: Category[], id: string, parentId: string | null): Category[] => {
      if (parentId) {
        return categories.map(cat => {
          if (cat.id === parentId) {
            return {
              ...cat,
              children: cat.children?.filter(child => child.id !== id)
            };
          }
          if (cat.children) {
            return {
              ...cat,
              children: categoryTree.removeCategoryFromTree(cat.children, id, parentId)
            };
          }
          return cat;
        });
      }
      return categories.filter(cat => cat.id !== id);
    }
  };

  // UI Handlers
  const handlers = {
    startEditing: (category: Category) => {
      setEditingId(category.id);
      setEditName(category.name);
      setAddingSubcategoryFor(null);
    },

    cancelEditing: () => {
      setEditingId(null);
      setEditName("");
      setAddingSubcategoryFor(null);
    },

    saveEditing: async (id: string) => {
      if (!editName.trim()) {
        toast.error("Category name cannot be empty");
        return;
      }

      const success = await api.updateCategory(id, editName);
      if (success) {
        setCategories(prev => 
          categoryTree.updateCategoryInTree(prev, id, { name: editName.trim() })
        );
        handlers.cancelEditing();
      }
    },

    addMainCategory: async () => {
      if (!newCategoryName.trim()) {
        toast.error("Category name cannot be empty");
        return;
      }

      const newCategory = await api.addCategory(newCategoryName, null);
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName("");
        setIsAddingMainCategory(false);
      }
    },

    startAddingSubcategory: (parentId: string) => {
      const parentCategory = categoryTree.findCategory(parentId, categories);
      if (parentCategory?.parentId) {
        toast.error("You can only add subcategories to main categories");
        return;
      }
      setAddingSubcategoryFor(parentId);
      setEditingId("new-subcategory");
      setEditName("");
    },

    addSubcategory: async (parentId: string) => {
      if (!editName.trim()) {
        toast.error("Category name cannot be empty");
        return;
      }

      const newCategory = await api.addCategory(editName, parentId);
      if (newCategory) {
        setCategories(prev => 
          categoryTree.addSubcategoryToTree(prev, parentId, newCategory)
        );
        handlers.cancelEditing();
      }
    },

    duplicateCategory: async (category: Category) => {
      const newCategory = await api.addCategory(
        `${category.name} (Copy)`, 
        category.parentId
      );
      
      if (newCategory) {
        if (category.parentId) {
          setCategories(prev => 
            categoryTree.addSubcategoryToTree(prev, category.parentId!, newCategory)
          );
        } else {
          setCategories(prev => [...prev, newCategory]);
        }
      }
    },

    deleteCategory: async (id: string, parentId: string | null) => {
      if (!window.confirm("Are you sure you want to delete this category and all its subcategories?")) {
        return;
      }

      const success = await api.deleteCategory(id);
      if (success) {
        setCategories(prev => 
          categoryTree.removeCategoryFromTree(prev, id, parentId)
        );
      }
    }
  };

  // Search and Filter
  const search = {
    flattenCategories: (cats: Category[]): Category[] => {
      return cats.reduce<Category[]>((acc, cat) => [
        ...acc,
        cat,
        ...(cat.children ? search.flattenCategories(cat.children) : [])
      ], []);
    },

    filteredCategories: searchTerm
      ? search.flattenCategories(categories).filter(cat =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : categories
  };

  // Category Item Component
  const CategoryItem: React.FC<{
    category: Category;
    level: number;
    isSearching: boolean;
  }> = ({ category, level, isSearching }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isEditing = editingId === category.id;
    const isAddingSubcategory = editingId === "new-subcategory" && addingSubcategoryFor === category.id;
    const isExpanded = category.isExpanded ?? false;
    const isMainCategory = category.parentId === null;

    return (
      <React.Fragment key={category.id}>
        {isEditing && (
        <div 
          className="flex items-center py-2 pl-2 pr-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2"
          style={{ marginLeft: `${level * 12 + 32}px` }}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handlers.saveEditing(category.id);
              if (e.key === "Escape") handlers.cancelEditing();
            }}
            placeholder="Category name"
          />
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => handlers.saveEditing(category.id)}
              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Save"
              disabled={isLoading || !editName.trim()}
            >
              <FiSave size={16} />
            </button>
            <button
              onClick={handlers.cancelEditing}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Cancel"
              disabled={isLoading}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Regular category item (shown when not editing) */}
      {!isEditing && (
        <div
          className={`flex items-center py-2 px-2 transition-colors duration-150 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50`}
          style={{ 
            marginLeft: `${level * 12}px`,
            marginBottom: '4px'
          }}
        >
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            <button
              onClick={() => categoryTree.toggleExpand(category.id)}
              className="p-1 mr-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {isExpanded ? (
                <FiChevronDown size={18} />
              ) : (
                <FiChevronRight size={18} />
              )}
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Category content */}
          <div className={`flex-1 flex items-center justify-between p-1 rounded-lg`}>
            <div className="flex flex-col min-w-0">
              <span className={`font-medium ${isMainCategory ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'} truncate`}>
                {category.name}
                {!isMainCategory && (
                  <span className="ml-2 text-xs text-gray-400">(subcategory)</span>
                )}
              </span>
            </div>

            <div className="flex gap-1">
              {isMainCategory && (
                <button
                  onClick={() => handlers.startAddingSubcategory(category.id)}
                  className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Add subcategory"
                  disabled={isLoading}
                >
                  <FiPlus size={16} />
                </button>
              )}
              <button
                onClick={() => handlers.duplicateCategory(category)}
                className="p-2 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Duplicate"
                disabled={isLoading}
              >
                <FiCopy size={16} />
              </button>
              <button
                onClick={() => handlers.startEditing(category)}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Edit"
                disabled={isLoading}
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => handlers.deleteCategory(category.id, category.parentId)}
                className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Delete"
                disabled={isLoading}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        )}
        
      {/* Add Subcategory input at the bottom */}
      {isAddingSubcategory && (
        <div 
          className="flex items-center py-2 px-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-2"
          style={{ marginLeft: `${level * 12 + 32}px` }}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handlers.addSubcategory(category.id);
              if (e.key === "Escape") handlers.cancelEditing();
            }}
            placeholder="New subcategory name"
          />
          <div className="flex gap-1 ml-2 mr-1">
            <button
              onClick={() => handlers.addSubcategory(category.id)}
              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Save"
              disabled={isLoading || !editName.trim()}
            >
              <FiSave size={16} />
            </button>
            <button
              onClick={handlers.cancelEditing}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Cancel"
              disabled={isLoading}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Children - Only show if parent is a main category */}
      {hasChildren && isExpanded && !isSearching && isMainCategory && (
        <div className="ml-4">
          {category.children?.map((child) => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              level={0} 
              isSearching={false}
            />
          ))}
        </div>
      )}
      </React.Fragment>
    );
  };

  return (
    <div className="p-4 flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl mx-auto shadow overflow-y-auto dark:shadow-gray-700/20">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex flex-col md:flex-row md:justify-between w-full md:items-center gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setIsAddingMainCategory(true);
                setNewCategoryName("");
              }}
              disabled={isAddingMainCategory || isLoading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm shadow-sm ${
                isAddingMainCategory || isLoading
                  ? 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FaPlus className="mr-2 h-3 w-3" /> Add Category
            </button>
          </div>

          {/* Add Main Category Form */}
          {isAddingMainCategory && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Add New Category
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlers.addMainCategory();
                  }}
                />
                <button
                  onClick={handlers.addMainCategory}
                  disabled={isLoading || !newCategoryName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingMainCategory(false);
                    setNewCategoryName("");
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : searchTerm ? (
            search.filteredCategories.length > 0 ? (
              <div className="space-y-1">
                {search.filteredCategories.map((category) => (
                  <CategoryItem 
                    key={category.id} 
                    category={category} 
                    level={0}
                    isSearching={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                  No categories found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or create a new category
                </p>
              </div>
            )
          ) : categories.length > 0 ? (
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryItem 
                  key={category.id} 
                  category={category} 
                  level={0}
                  isSearching={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                No categories yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first category
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;