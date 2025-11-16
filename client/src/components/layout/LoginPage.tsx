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
      {/* Very Light Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Yulu Bikes + People Interacting + Handshakes */}
        <div className="absolute inset-0 opacity-20">
          
          {/* Cyan Yulu Bike (Top Left) */}
          <div className="absolute top-20 left-16 w-40 h-40 animate-[float_6s_ease-in-out_infinite]">
            <svg viewBox="0 0 200 200" fill="none">
              <ellipse cx="100" cy="120" rx="70" ry="20" fill="#0EA5E9" opacity="0.2"/>
              <rect x="70" y="60" width="60" height="40" rx="10" fill="#0EA5E9"/>
              <rect x="90" y="50" width="20" height="15" rx="5" fill="#334155"/>
              <circle cx="80" cy="130" r="15" fill="#1E293B" stroke="#0EA5E9" strokeWidth="3"/>
              <circle cx="120" cy="130" r="15" fill="#1E293B" stroke="#0EA5E9" strokeWidth="3"/>
              <path d="M100 50 L110 40 L115 45" stroke="#334155" strokeWidth="3" fill="none"/>
            </svg>
          </div>

          {/* Red Yulu Bike (Bottom Right) */}
          <div className="absolute bottom-24 right-20 w-36 h-36 animate-[float_7s_ease-in-out_infinite_1s]">
            <svg viewBox="0 0 200 200" fill="none">
              <ellipse cx="100" cy="120" rx="70" ry="20" fill="#EF4444" opacity="0.2"/>
              <rect x="70" y="60" width="60" height="40" rx="10" fill="#EF4444"/>
              <rect x="90" y="50" width="20" height="15" rx="5" fill="#334155"/>
              <circle cx="80" cy="130" r="15" fill="#1E293B" stroke="#EF4444" strokeWidth="3"/>
              <circle cx="120" cy="130" r="15" fill="#1E293B" stroke="#EF4444" strokeWidth="3"/>
              <path d="M100 50 L110 40 L115 45" stroke="#334155" strokeWidth="3" fill="none"/>
            </svg>
          </div>

          {/* Handshake Emoji 1 */}
          <div className="absolute top-1/3 right-1/4 text-6xl animate-[float_8s_ease-in-out_infinite_2s]">
            🤝
          </div>

          {/* Handshake Emoji 2 */}
          <div className="absolute bottom-1/3 left-1/4 text-5xl animate-[float_7.5s_ease-in-out_infinite_1.5s]">
            🤝
          </div>

          {/* People Interacting - Emoji 1 */}
          <div className="absolute top-1/2 left-16 text-5xl animate-[float_6.5s_ease-in-out_infinite_0.5s]">
            👥
          </div>

          {/* People Interacting - Emoji 2 */}
          <div className="absolute top-40 right-32 text-4xl animate-[float_7.2s_ease-in-out_infinite_1.8s]">
            👔
          </div>

          {/* Team/Collaboration */}
          <div className="absolute bottom-40 left-1/3 text-5xl animate-[float_6.8s_ease-in-out_infinite_1.2s]">
            👨‍💼👩‍💼
          </div>

          {/* More Handshakes */}
          <div className="absolute top-2/3 right-1/3 text-4xl animate-[float_7.8s_ease-in-out_infinite_2.2s]">
            🤝
          </div>

          {/* Workforce Icon */}
          <div className="absolute bottom-1/2 right-20 text-5xl animate-[float_6.3s_ease-in-out_infinite_0.8s]">
            💼
          </div>

        </div>
      </div>

      {/* Reduced Width Login Card */}
      <div className="relative w-full max-w-4xl">
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}