import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Inspiring quotes about tech innovation, workforce management, and people
const quotes = [
  "Empowering teams through intelligent workforce management.",
  "Technology that puts people first.",
  "Innovation in every aspect of human resources.",
  "Building the future of workforce excellence.",
  "Where technology meets human potential.",
  "Transforming work, empowering people.",
  "Smart solutions for modern workforce challenges.",
  "People are our greatest asset, technology is our tool.",
  "Redefining workforce management for the digital age.",
  "Connecting talent with opportunity through innovation.",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const { login } = useAuth();
  const { toast } = useToast();

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome to Yulite HRMS",
      });
    } catch (error: any) {
      setError(error.message || "Login failed");
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 font-['Inter',sans-serif]">
      {/* Professional Background with HRMS-related imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* HRMS-related SVG Icons Pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          {/* People/Team Icons scattered across background */}
          <svg className="absolute top-20 left-20 w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          
          <svg className="absolute top-40 right-32 w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          
          <svg className="absolute bottom-32 left-40 w-28 h-28 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>
          </svg>
          
          <svg className="absolute top-1/2 left-1/4 w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
          </svg>
          
          <svg className="absolute bottom-20 right-20 w-20 h-20 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          
          <svg className="absolute top-3/4 right-1/3 w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
          </svg>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-purple-100/30"></div>
      </div>

      {/* Horizontally Wide Login Card */}
      <div className="relative w-full max-w-5xl">
        {/* Blue Glow Behind Card */}
        <div className="absolute inset-0 bg-blue-600/30 rounded-2xl blur-2xl scale-105"></div>
        
        {/* Main Card - Wide Horizontal Layout */}
        <div 
          className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden animate-[fadeInUp_0.6s_ease-out]"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Branding & Quote */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-12 flex flex-col justify-center text-white">
              {/* Title and Tagline - NO LOGO */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-3">
                  Yulite HRMS
                </h1>
                <p className="text-lg text-blue-100">
                  Effortless workforce management.
                </p>
              </div>
              
              {/* Current Quote Display */}
              <div className="mt-auto">
                <div className="border-l-4 border-blue-300 pl-4">
                  <p 
                    key={`quote-${currentQuoteIndex}`}
                    className="text-lg text-blue-50 italic animate-[fadeIn_1s_ease-in]"
                  >
                    "{quotes[currentQuoteIndex]}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-12 flex flex-col justify-center">{/* Title for form */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  Sign In
                </h2>
                <p className="text-slate-600">
                  Welcome back! Please enter your credentials.
                </p>
              </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-[15px] font-medium text-slate-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full h-[52px] px-4 text-base border border-slate-300 rounded-lg
                             focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
                             transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed
                             text-slate-800 placeholder:text-slate-400"
                  placeholder="you@company.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-[15px] font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full h-[52px] px-4 text-base border border-slate-300 rounded-lg
                             focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
                             transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed
                             text-slate-800 placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                           text-white font-semibold text-base rounded-lg
                           transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
                           shadow-md hover:shadow-lg
                           flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <button 
                type="button"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                © 2025 Yulite HRMS. All rights reserved.
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
          }
          10%, 90% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}