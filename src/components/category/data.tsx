import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
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

  useEffect(() => {
    const sampleData: Category[] = [
      {
        id: "cat-1",
        name: "Food & Dining",
        parentId: null,
        isExpanded: true,
        children: [
          {
            id: "cat-4",
            name: "Groceries",
            parentId: "cat-1",
            isExpanded: true,
          },
          {
            id: "cat-5",
            name: "Restaurants",
            parentId: "cat-1",
            isExpanded: true,
          },
        ],
      },
      {
        id: "cat-2",
        name: "Transportation",
        parentId: null,
        isExpanded: true,
        children: [
          { id: "cat-6", name: "Fuel", parentId: "cat-2", isExpanded: true },
          {
            id: "cat-7",
            name: "Public Transport",
            parentId: "cat-2",
            isExpanded: true,
          },
        ],
      },
      { id: "cat-3", name: "Utilities", parentId: null, isExpanded: true },
    ];
    setCategories(sampleData);
  }, []);

  const toggleExpand = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          return { ...cat, isExpanded: !cat.isExpanded };
        }
        if (cat.children) {
          return {
            ...cat,
            children: cat.children.map((child) =>
              child.id === id
                ? { ...child, isExpanded: !child.isExpanded }
                : child
            ),
          };
        }
        return cat;
      })
    );
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEditing = (id: string) => {
    if (!editName.trim()) return;

    const updateCategoryInTree = (categories: Category[]): Category[] => {
      return categories.map((cat) => {
        if (cat.id === id) {
          return { ...cat, name: editName.trim() };
        }
        if (cat.children) {
          return {
            ...cat,
            children: updateCategoryInTree(cat.children),
          };
        }
        return cat;
      });
    };

    setCategories((prev) => updateCategoryInTree(prev));
    cancelEditing();
  };

  const generateId = () =>
    `cat-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

  const addMainCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      parentId: null,
      isExpanded: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
    setIsAddingMainCategory(false);
  };

  const addSubcategory = (parentId: string) => {
    const newCategory: Category = {
      id: generateId(),
      name: `New Subcategory`,
      parentId: parentId,
      isExpanded: true,
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === parentId
          ? {
              ...cat,
              children: [...(cat.children || []), newCategory],
              isExpanded: true,
            }
          : cat
      )
    );

    // Start editing the new subcategory immediately
    setEditingId(newCategory.id);
    setEditName(newCategory.name);
  };

  const duplicateCategory = (category: Category) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      name: `${category.name} (Copy)`,
    };

    if (category.parentId) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === category.parentId
            ? {
                ...cat,
                children: [...(cat.children || []), newCategory],
              }
            : cat
        )
      );
    } else {
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const deleteCategory = (id: string, parentId: string | null) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category and all its subcategories?"
      )
    )
      return;

    if (parentId) {
      // Delete subcategory
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === parentId
            ? {
                ...cat,
                children: cat.children?.filter((child) => child.id !== id),
              }
            : cat
        )
      );
    } else {
      // Delete main category
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    return cats.reduce<Category[]>((acc, cat) => {
      return [
        ...acc,
        cat,
        ...(cat.children ? flattenCategories(cat.children) : []),
      ];
    }, []);
  };

  const filteredCategories = searchTerm
    ? flattenCategories(categories).filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories;

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isEditing = editingId === category.id;
    const isExpanded = category.isExpanded ?? true;

    if (
      searchTerm &&
      !(
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return null;
    }

    return (
      <React.Fragment key={category.id}>
        <div
          className={`flex items-center py-2 sm:px-2 transition-colors duration-150
            ${
              isEditing
                ? "bg-blue-50 dark:bg-blue-900/30"
                : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {/* Expand/collapse toggle */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 w-10 flex justify-center text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {isExpanded ? (
                <FiChevronDown size={18} />
              ) : (
                <FiChevronRight size={18} />
              )}
            </button>
          ) : (
            <div className="w-6 sm:w-11" />
          )}

          {/* Category content */}
          <div
            className={`flex-1 flex items-center justify-between p-1 rounded-lg`}
          >
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 sm:px-3 py-1 sm:py-2 text-sm border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEditing(category.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                />
                <div className="flex">
                  <button
                    onClick={() => saveEditing(category.id)}
                    className="p-1 sm:p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Save"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 sm:p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Cancel"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm sm:text-base">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {category.id}
                  </span>
                </div>

                <div className="flex space-x-0 sm:space-x-1 ml-1 sm:ml-2">
                  {category.parentId === null && (
                    <button
                      onClick={() => addSubcategory(category.id)}
                      className="p-1 sm:p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Add subcategory"
                    >
                      <FiPlus size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => duplicateCategory(category)}
                    className="p-1 sm:p-2 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Duplicate"
                  >
                    <FiCopy size={16} />
                  </button>
                  <button
                    onClick={() => startEditing(category)}
                    className="p-1 sm:p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      deleteCategory(category.id, category.parentId)
                    }
                    className="p-1 sm:p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren &&
          isExpanded &&
          category.children?.map((child) => renderCategory(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="p-2 sm:p-4 flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl mx-auto shadow overflow-y-auto dark:shadow-gray-700/20">
        <div className="sticky top-0 bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row md:justify-between w-full md:items-center mb-4 sm:mb-6 gap-3">
          <div className="relative flex-1 min-w-[160px]">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 " />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <button
            onClick={() => {
              setIsAddingMainCategory(true);
              setNewCategoryName("");
            }}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap text-sm shadow-sm hover:shadow-md"
          >
            <FiPlus className="mr-1 sm:mr-2" /> Add
          </button>
        </div>

        {/* Add Main Category Form */}
        {isAddingMainCategory && (
          <div className="mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-700/30 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-200">
              Add Category
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addMainCategory()}
              />
              <div className="flex gap-2">
                <button
                  onClick={addMainCategory}
                  className="px-3 sm:px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 shadow-sm hover:shadow-md"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingMainCategory(false)}
                  className="px-3 sm:px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 rounded-lg transition-colors flex-1 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
          {filteredCategories.length > 0 || searchTerm ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {searchTerm
                ? filteredCategories.map((category) => renderCategory(category))
                : categories.map((category) => renderCategory(category))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
                <FiPlus className="text-gray-400 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
                No categories yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3 sm:mb-4 text-sm sm:text-base">
                Get started by adding your first category
              </p>
              <button
                onClick={() => setIsAddingMainCategory(true)}
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center text-sm shadow-sm hover:shadow-md"
              >
                <FiPlus className="mr-1 sm:mr-2" /> Add Category
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
