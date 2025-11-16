import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gradient-to-br from-[#F6FAFF] to-[#EAF4FB] flex items-center justify-center p-4 font-['Inter',sans-serif]">
      {/* Login Card with fade-in animation */}
      <div 
        className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_4px_22px_rgba(0,0,0,0.06)] p-10 animate-[fadeInUp_0.5s_ease-out]"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="#14D4EF"/>
              <path d="M50 25 C35 25, 25 35, 25 50 L25 75 C25 85, 35 85, 40 80 L40 50 C40 42, 45 37, 50 37 C55 37, 60 42, 60 50 L60 80 C65 85, 75 85, 75 75 L75 50 C75 35, 65 25, 50 25 Z" fill="white"/>
              <path d="M35 35 C42 28, 50 25, 58 28 M42 32 C48 28, 52 28, 58 32" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          
          {/* Title and Tagline */}
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Yulite HRMS
          </h1>
          <p className="text-[15px] font-medium text-slate-500">
            Effortless workforce management.
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
              className="w-full h-[50px] px-4 text-base border border-[#D4DDE8] rounded-lg
                         focus:outline-none focus:border-[#14D4EF] focus:ring-2 focus:ring-[#14D4EF]/20
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
              className="w-full h-[50px] px-4 text-base border border-[#D4DDE8] rounded-lg
                         focus:outline-none focus:border-[#14D4EF] focus:ring-2 focus:ring-[#14D4EF]/20
                         transition-all duration-200 disabled:bg-slate-50 disabled:cursor-not-allowed
                         text-slate-800 placeholder:text-slate-400"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] bg-[#14D4EF] hover:bg-[#10BDD6] active:bg-[#0EAAC3]
                       text-white font-semibold text-base rounded-lg
                       transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
                       shadow-sm hover:shadow-md
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
            className="text-sm text-[#6B7280] hover:text-[#14D4EF] transition-colors duration-200"
          >
            Forgot Password?
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[12px] text-slate-500">
            © 2025 Yulite HRMS. All rights reserved.
          </p>
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
      `}</style>
    </div>
  );
}