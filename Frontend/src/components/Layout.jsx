import { useState } from "react";
import Sidebar from "./SideBar";
import Navbar from "./Navbar";
import BottomBar from "./BottomBar";

const Layout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    // TODO: Enable realtime notification badge updates with toasts...
    <div className="min-h-screen bg-base-100">
      {/* Desktop */}
      <div className="hidden md:block">
        <Sidebar
          isExpanded={sidebarExpanded}
          setIsExpanded={setSidebarExpanded}
        />

        <main
          className={`
            transition-all duration-300
            ${sidebarExpanded ? "ml-64" : "ml-20"}
          `}
        >
          {children}
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Navbar />
        <main className="pt-0 pb-0 px-2">{children}</main>
        <BottomBar />
      </div>
    </div>
  );
};

export default Layout;
