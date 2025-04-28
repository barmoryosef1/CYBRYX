import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, FileText, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CyberChat from '@/components/chat/CyberChat';
import { useState } from "react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    height="1.5em"
    width="1.5em"
    {...props}
  >
    <path d="M20.317 4.369A19.791 19.791 0 0016.885 3.1a.074.074 0 00-.078.037c-.34.607-.719 1.395-.984 2.01a18.524 18.524 0 00-5.59 0 12.51 12.51 0 00-.995-2.01.077.077 0 00-.078-.037A19.736 19.736 0 003.677 4.369a.069.069 0 00-.032.027C.533 9.09-.32 13.579.099 18.021a.082.082 0 00.031.056c2.104 1.547 4.13 2.488 6.102 3.104a.077.077 0 00.084-.027c.472-.65.892-1.34 1.245-2.065a.076.076 0 00-.041-.104c-.662-.25-1.293-.549-1.902-.892a.077.077 0 01-.008-.127c.128-.096.256-.197.378-.299a.074.074 0 01.077-.01c3.993 1.825 8.285 1.825 12.223 0a.075.075 0 01.078.009c.122.102.25.203.379.299a.077.077 0 01-.006.127 12.298 12.298 0 01-1.904.893.076.076 0 00-.04.104c.36.726.78 1.415 1.246 2.065a.076.076 0 00.084.028c1.978-.616 4.004-1.557 6.107-3.104a.077.077 0 00.03-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 00-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z" />
  </svg>
);

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();

  const navigation = [
    { name: "IOC Analysis", href: "/", icon: AlertTriangle },
    { name: "Vulnerabilities", href: "/vulnerabilities", icon: FileText },
    { name: "Cybersecurity AI", href: "/cyber-ai", icon: MessageCircle },
    { name: "Documentation", href: "/docs", icon: FileText },
  ];

  return (
    <div
      className={cn(
        "glass-effect relative z-10 flex flex-col h-full transition-all duration-300 ease-in-out border-r border-border/20",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-1">
            <img 
              src="/cybryx-logo.svg" 
              alt="CYBRYX Logo" 
              className="h-8 w-8"
            />
          </div>
          {open && (
            <span className="font-semibold text-lg gradient-text whitespace-nowrap">
              CYBRYX
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="button-hover p-2 rounded-lg text-muted-foreground hover:text-accent"
        >
          {open ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "nav-item group relative",
              location.pathname === item.href
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {open && (
              <span className="font-medium truncate transition-opacity duration-200">
                {item.name}
              </span>
            )}
            {!open && (
              <div className="tooltip-text left-full ml-2">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/20">
        {/* Discord Button */}
        <a
          href="https://discord.gg/4jjmXqPD"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-white hover:bg-indigo-50 transition border border-gray-200 mb-2",
            !open && "justify-center"
          )}
          style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.06)" }}
        >
          <DiscordIcon className="text-indigo-600" />
          {open && <span className="font-medium text-indigo-700">Join Discord</span>}
        </a>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 mb-2",
          !open && "justify-center"
        )}>
          <div className="status-dot active" />
          {open && (
            <span className="text-sm text-muted-foreground">
              System Online
            </span>
          )}
        </div>
        {/* Chat Button */}
        <div className={cn("mt-2 flex", open ? "justify-between" : "justify-center")}> 
          {open ? (
            <button
              className="w-full px-3 py-2 rounded-lg bg-cyber-accent text-cyber-accent-foreground font-medium hover:bg-cyber-accent/80 transition mb-1"
            >
              {/* Chat button content */}
            </button>
          ) : (
            <button
              className="p-2 rounded-lg bg-cyber-accent text-cyber-accent-foreground hover:bg-cyber-accent/80 transition"
              title="Open Chat"
              onClick={() => {
                setOpen(true);
                setTimeout(() => {
                  const input = document.querySelector('input[placeholder="Ask a cybersecurity question..."]');
                  if (input) (input as HTMLInputElement).focus();
                }, 300);
              }}
            >
              {/* Chat button content */}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
