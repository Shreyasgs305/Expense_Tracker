import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

const PageLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="min-h-screen lg:ml-[240px]">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
};

export default PageLayout;
