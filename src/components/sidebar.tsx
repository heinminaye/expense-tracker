import React, { createContext, ReactNode, useContext } from "react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { LuLayoutDashboard, LuLogOut } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { TbCategory } from "react-icons/tb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useStore from "../store";
import { toast } from "sonner";

interface SidebarContextType {
  isSidebarOpen: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ isSidebarOpen: true });

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  link: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, setSidebarState, setAuthToken, set } = useStore((state) => state);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
    set({ user: null, token: null });
    navigate("/");
    toast.success("Successfully signed out");
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
        isSidebarOpen ? "w-[250px] fixed lg:relative" : "w-[76px] hidden sm:flex"
      } transition-all duration-500 ease-in-out`}
    >
      {/* Sidebar Navigation */}
      <nav
        className={`h-screen z-20 bg-white dark:bg-slate-800 dark:text-white flex flex-col border-r dark:border-slate-600 shadow-md ${
          isSidebarOpen ? "w-[250px]" : "w-[76px]"
        } transition-all duration-500 ease-in-out`}
      >
        <div className="relative pb-2 flex justify-between items-center">
          <div className="w-full flex p-3 overflow-hidden">
            {/* Profile Image */}
            <div
              className={`flex justify-center items-center w-10 h-10 rounded-lg bg-blue-400 text-white ${
                isSidebarOpen ? "mr-3" : "mr-0"
              } transition-all duration-500 ease-in-out`}
            >
              {profileInitial}
            </div>

            {/* Profile text container */}
            <div
              className={`flex flex-col justify-between leading-5 overflow-hidden ${
                isSidebarOpen ? "w-36 opacity-100" : "w-0 opacity-0"
              } transition-all duration-500 ease-in-out text-gray-700 dark:text-gray-200`}
            >
              <h4 className="font-semibold truncate">{profileName}</h4>
              <span className="text-xs truncate">admin@gmail.com</span>
            </div>
          </div>

          <div className="absolute -right-3 rounded-full bg-white dark:bg-slate-800 text-blue-500 text-2xl cursor-pointer shadow-md transition duration-500 ease-in-out">
            {isSidebarOpen ? (
              <IoIosArrowDropleftCircle onClick={handleSidebarToggle} />
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
            <div className="mt-auto mb-4">
              <SidebarItem
                icon={<LuLogOut />}
                text="Sign Out"
                link="#"
                onClick={handleSignOut}
              />
            </div>
          </ul>
        </SidebarContext.Provider>
      </nav>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black opacity-50 z-10 transition-opacity duration-500 ease-in-out ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={handleSidebarToggle}
      />
    </aside>
  );
}

export function SidebarItem({ icon, text, link, active, onClick }: SidebarItemProps) {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <li
      className={`flex items-center justify-center my-2 rounded-lg cursor-pointer group ${
        active
          ? "bg-gradient-to-tr from-blue-400 to-blue-300 text-white shadow-md"
          : "hover:bg-blue-100 dark:hover:bg-slate-600 dark:hover:text-gray-200 text-gray-700 dark:text-gray-300"
      } ${isSidebarOpen ? "w-full" : "w-12"} transition-all duration-500 ease-in-out`}
    >
      <Link
        to={link}
        onClick={onClick}
        className={`flex items-center py-2 px-3.5 h-full w-full ${isSidebarOpen ? "" : ""}`}
      >
        {/* Icon */}
        <div className="text-lg group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>

        {/* Text */}
        <span
          className={`overflow-hidden whitespace-nowrap ml-4 ${
            isSidebarOpen ? "opacity-100 " : "opacity-0"
          } transition-opacity duration-300 ease-in-out`}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}
