import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { LuLayoutDashboard } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { TbCategory } from "react-icons/tb";
import useStore from "../store";
import { Link, useLocation } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";

const SidebarContext = createContext();

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  link: string;
  active?: boolean;
}

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, setSidebarState } = useStore(
    (state) => state
  );
  const location = useLocation();
  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  const profileName = "Admin";
  const profileInitial = profileName.slice(0, 2).toUpperCase();

  const sidebarItems = [
    { icon: <LuLayoutDashboard />, text: "Dashboard", link: "/dashboard" },
    { icon: <TbCategory />, text: "Category", link: "/category" },
    { icon: <TbCategory />, text: "Income", link: "/income" },
    { icon: <TbCategory />, text: "Expense", link: "/expense" },
  ];

  return (
    <aside
      className={`h-full flex z-30 sm:sticky justify-between ${
        isSidebarOpen
          ? "w-[250px] fixed lg:relative"
          : "w-[76px] hidden sm:flex"
      } transition-width duration-300 ease-in-out`}
    >
      {/* Sidebar Navigation */}
      <nav
        className={`h-screen z-20 bg-white dark:bg-slate-800 dark:text-white flex flex-col border-r dark:border-slate-500 shadow-sm ${
          isSidebarOpen ? "w-[250px]" : "w-[76px]"
        } transition-width duration-300 ease-in-out`}
      >
        <div className="relative pb-2 flex justify-between items-center">
          <div className="w-full flex p-3 overflow-hidden">
            {/* Profile Image */}
            <div
              className={`flex justify-center items-center w-10 h-10 rounded-md bg-blue-400 text-white ${
                isSidebarOpen ? "mr-3" : "mr-0"
              } transition-all duration-300 ease-in-out`}
            >
              {profileInitial}
            </div>

            {/* Profile text container */}
            <div
              className={`flex flex-col justify-between text-gray-600 dark:text-gray-200 leading-5 overflow-hidden ${
                isSidebarOpen ? "w-36 opacity-100" : "w-0 opacity-0"
              } transition-all duration-200 ease-in-out`}
            >
              <h4 className="font-semibold truncate">{profileName}</h4>{" "}
              {/* Apply truncate here */}
              <span className="text-xs truncate">
                admin@gmail.com
              </span>
            </div>
          </div>
          <div className="absolute -right-3 rounded-full bg-white dark:bg-slate-800 text-blue-500 text-2xl cursor-pointer duration-300 ease-in-out">
            {isSidebarOpen ? (
              <IoIosArrowDropleftCircle
                className=""
                onClick={handleSidebarToggle}
              />
            ) : (
              <IoIosArrowDroprightCircle onClick={handleSidebarToggle} />
            )}
          </div>
        </div>
        <SidebarContext.Provider value={{ isSidebarOpen }}>
          <ul className="flex-1 flex flex-col px-3 overflow-y-auto overflow-x-hidden">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                text={item.text}
                link={item.link}
                active={location.pathname === item.link}
              />
            ))}
            <div className="mt-auto">
              <SidebarItem
                key={5}
                icon={<LuLogOut />}
                text={"Sign Out"}
                link={"/sign-out"}
                active={false}
              />
            </div>
          </ul>
        </SidebarContext.Provider>
      </nav>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black opacity-80 z-10 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={handleSidebarToggle}
      />
    </aside>
  );
}

export function SidebarItem({ icon, text, link, active }: SidebarItemProps) {
  const { isSidebarOpen } = useContext(SidebarContext);
  return (
    <li
      className={`flex items-center  justify-center my-3 mr-2 rounded-md cursor-pointer group ${
        active
          ? "bg-gradient-to-tr from-blue-400 to-blue-300 text-white"
          : "hover:bg-blue-100 dark:hover:bg-slate-600 dark:hover:text-gray-300 text-gray-700 dark:text-gray-300"
      } ${isSidebarOpen ? "w-full" : "w-10 "} transition-all duration-300`}
    >
      <Link
        to={`${link}`}
        className={`flex h-full items-center w-full py-2 px-[11px]`}
      >
        {/* Icon container */}
        <div className="text-lg">{icon}</div>

        {/* Text container */}
        <span
          className={`overflow-hidden items-center text-md ${
            isSidebarOpen ? "w-50 ml-6" : "w-0"
          } whitespace-nowrap`}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}
