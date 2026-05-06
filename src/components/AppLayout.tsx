import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { RoleProvider } from "@/contexts/RoleContext";
import { LLMProvider } from "@/contexts/LLMContext";

const AppLayout = () => {
  return (
    <RoleProvider>
      <LLMProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto px-6 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      </LLMProvider>
    </RoleProvider>
  );
};

export default AppLayout;
