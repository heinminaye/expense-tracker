import React, { useEffect, useState } from "react";
import { FiAlignJustify } from "react-icons/fi";
import useStore from "../store";
import { RiSearch2Line } from "react-icons/ri";
import { FaMoon, FaSun } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function NavBar() {
  const { theme, setTheme, isSidebarOpen, toggleSidebar, setSidebarState } = useStore();
  const location = useLocation();

  const handleSidebarToggle = () => {
    toggleSidebar();
  };
  
  const toggleDarkMode = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const getPageName = (pathname:string) => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/category":
        return "Category";
      // case "/income":
      //   return "Income";
      case "/expense":
          return "Expense";
      default:
        return "";
    }
  };

  return (
    <nav className="sticky top-0 w-full h-[64px] px-5 z-20 bg-gray bg-white dark:bg-slate-800 dark:text-white flex items-center justify-between">
      <button className="sm:hidden" onClick={handleSidebarToggle}>
        <FiAlignJustify
          className="text-2xl"
        />
      </button>
      <div className="ml-2 text-lg font-semibold">
        {getPageName(location.pathname)}
      </div>
      <div className="flex justify-end">
        {/* <div className="hidden relative sm:flex items-center space-x-3 w-[300px] mr-5">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-1.5 pl-5 pr-9 rounded-lg border border-gray-300 dark:bg-slate-800 dark:border-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
          />
          <RiSearch2Line className="absolute h-full flex justify-center items-center right-3.5 text-md text-gray-500 dark:text-gray-400" />
        </div> */}

        {/* Dark Mode Toggle */}
        <div className="hidden sm:flex items-center">
          <button onClick={toggleDarkMode} className="flex items-center">
            <div className="relative">
              <div className="w-[3.5rem] h-7 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer dark:bg-slate-600">
                <div className="text-gray-700 absolute left-1 dark:opacity-0 opacity-100">
                  <FaMoon className="transition-opacity duration-300 text-white" />
                </div>
                <div className="text-yellow-500 absolute right-1 dark:opacity-100 opacity-0">
                  <FaSun className="transition-opacity duration-300" />
                </div>
                <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 dark:-translate-x-3.5 translate-x-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Mobile Design */}
        <button onClick={toggleDarkMode} className="sm:hidden w-8 h-8 mr-3 bg-blue-400 dark:bg-gray-700 rounded-lg flex justify-center items-center">
          <FaMoon className="transition-opacity duration-300 dark:hidden text-white" />
          <FaSun className="transition-opacity duration-300 hidden dark:block text-yellow-500" />
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
