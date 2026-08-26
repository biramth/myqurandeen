import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
