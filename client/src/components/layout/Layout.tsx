import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LoginPage from "./LoginPage";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug logging
  console.log('🔍 Layout render:', { user: !!user, isLoading, loadingTimeout });

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ Setting loading timeout...');
      const timer = setTimeout(() => {
        console.warn('⚠️ Auth loading timeout - forcing login page');
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    } else {
      console.log('✅ Auth loading complete');
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !loadingTimeout) {
    console.log('🔑 Showing login page');
    return <LoginPage />;
  }

  if (!user && loadingTimeout) {
    console.log('⚠️ Loading timeout - forcing login page');
    return <LoginPage />;
  }

  console.log('🏠 Showing main app layout');
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      {/* Main Content Area with Fixed Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="sticky left-0 z-40">
          <Sidebar />
        </div>
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
