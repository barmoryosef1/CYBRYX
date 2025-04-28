import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="glass-effect border-t border-border/20 py-4 px-6">
            <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
              <span>Threat Horizon Guardian Eye</span>
              <span>© 2024 All rights reserved</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
