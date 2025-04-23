import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import Dashboard from "./pages/dashboard";
import useStore, { applyThemeToDOM } from "./store";
import { Toaster } from "sonner";
import SideBar from "./components/sidebar";
import NotFound from "./pages/notfound";
import NavBar from "./components/navbar";
import { useEffect, useState } from "react";
import Expense from "./pages/expense";
import Income from "./pages/income";
import Category from "./pages/category";

function RootLayout() {
  const { user } = useStore((state) => state);
  const { isSidebarOpen } = useStore((state) => state);
  return !user ? (
    <Navigate to="sign-in" replace={true} />
  ) : (
    <div className="flex h-screen">
  <SideBar />
  <div
    className={`lg:min-w-[calc(100vw-${isSidebarOpen ? '300px' : '74px'})] sm:absolute  sm:left-[74px] w-full h-screen sm:w-[calc(100vw-74px)] lg:relative lg:left-0`}
  >
    <NavBar />
    <div className="h-[calc(100vh-64px)] overflow-y-auto">
      <Outlet />
    </div>
  </div>
</div>

  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useStore();

  useEffect(() => {
    applyThemeToDOM(theme);
    setIsLoading(false);
  }, [theme]);

  return (
    <main>
      <div className="w-full min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/category" element={<Category />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />}></Route>
        </Routes>
      </div>
      <Toaster richColors position="top-center" />
    </main>
  );
}

export default App;
