"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Sidebar is hidden by default
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with sliding effect */}
      <Sidebar isVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-grow">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-grow bg-gray-100 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
