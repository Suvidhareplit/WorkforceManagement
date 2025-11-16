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
      {/* Professional Background - Night Sky with City */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-800">
        {/* City Skyline with Monuments in 4 Corners */}
        <div className="absolute inset-0">
          
          {/* TOP LEFT - Vidhana Soudha, Bangalore */}
          <div className="absolute top-8 left-8 w-48 h-40 opacity-20">
            <svg viewBox="0 0 200 160" fill="none">
              {/* Main Building - Granite */}
              <rect x="30" y="60" width="140" height="100" fill="#8B7D6B"/>
              <rect x="40" y="70" width="25" height="90" fill="#6B5D4F"/>
              <rect x="75" y="70" width="25" height="90" fill="#6B5D4F"/>
              <rect x="110" y="70" width="25" height="90" fill="#6B5D4F"/>
              <rect x="145" y="70" width="25" height="90" fill="#6B5D4F"/>
              {/* Central Dome */}
              <ellipse cx="100" cy="50" rx="30" ry="20" fill="#A89968"/>
              <rect x="95" y="50" width="10" height="10" fill="#D4AF37"/>
              {/* Windows */}
              <rect x="45" y="80" width="8" height="12" fill="#FFE4B5" opacity="0.6"/>
              <rect x="80" y="80" width="8" height="12" fill="#FFE4B5" opacity="0.6"/>
              <rect x="115" y="80" width="8" height="12" fill="#FFE4B5" opacity="0.6"/>
              <rect x="150" y="80" width="8" height="12" fill="#FFE4B5" opacity="0.6"/>
            </svg>
          </div>
          
          {/* TOP RIGHT - Gateway of India, Mumbai */}
          <div className="absolute top-8 right-8 w-44 h-44 opacity-20">
            <svg viewBox="0 0 180 180" fill="none">
              {/* Main Arch - Yellow Stone */}
              <rect x="40" y="80" width="100" height="100" fill="#D4A574"/>
              {/* Central Arch */}
              <path d="M 60 160 Q 60 100 90 100 Q 120 100 120 160" fill="#1E293B"/>
              {/* Side Pillars */}
              <rect x="30" y="100" width="20" height="80" fill="#C9956B"/>
              <rect x="130" y="100" width="20" height="80" fill="#C9956B"/>
              {/* Top Dome */}
              <ellipse cx="90" cy="75" rx="40" ry="25" fill="#B8916A"/>
              <circle cx="90" cy="60" r="15" fill="#D4AF37"/>
              {/* Decorative Elements */}
              <rect x="45" y="90" width="8" height="15" fill="#8B6F47"/>
              <rect x="127" y="90" width="8" height="15" fill="#8B6F47"/>
            </svg>
          </div>
          
          {/* BOTTOM LEFT - Red Fort, Delhi */}
          <div className="absolute bottom-20 left-8 w-52 h-36 opacity-20">
            <svg viewBox="0 0 220 150" fill="none">
              {/* Fort Walls - Red Sandstone */}
              <rect x="20" y="60" width="180" height="90" fill="#C13832"/>
              {/* Battlements */}
              <rect x="25" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="50" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="75" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="100" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="125" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="150" y="55" width="15" height="10" fill="#A82820"/>
              <rect x="175" y="55" width="15" height="10" fill="#A82820"/>
              {/* Central Gate */}
              <path d="M 90 150 Q 90 100 110 100 Q 130 100 130 150" fill="#1E293B"/>
              {/* Dome */}
              <ellipse cx="110" cy="40" rx="25" ry="15" fill="#F5F5DC"/>
              <circle cx="110" cy="30" r="8" fill="#D4AF37"/>
            </svg>
          </div>
          
          {/* BOTTOM RIGHT - Charminar, Hyderabad */}
          <div className="absolute bottom-20 right-8 w-44 h-48 opacity-20">
            <svg viewBox="0 0 180 200" fill="none">
              {/* Four Minarets */}
              <rect x="20" y="80" width="30" height="120" fill="#E8DCC4"/>
              <rect x="130" y="80" width="30" height="120" fill="#E8DCC4"/>
              <rect x="20" y="40" width="30" height="120" fill="#E8DCC4"/>
              <rect x="130" y="40" width="30" height="120" fill="#E8DCC4"/>
              {/* Domes on Minarets */}
              <ellipse cx="35" cy="35" rx="18" ry="12" fill="#D4A574"/>
              <ellipse cx="145" cy="35" rx="18" ry="12" fill="#D4A574"/>
              <ellipse cx="35" cy="75" rx="18" ry="12" fill="#D4A574"/>
              <ellipse cx="145" cy="75" rx="18" ry="12" fill="#D4A574"/>
              {/* Central Structure */}
              <rect x="55" y="120" width="70" height="80" fill="#F5DEB3"/>
              {/* Central Arches */}
              <path d="M 70 180 Q 70 150 90 150 Q 110 150 110 180" fill="#1E293B"/>
            </svg>
          </div>
          
          {/* City Road - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20">
            {/* Road Surface */}
            <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-gray-700 via-gray-600 to-transparent opacity-30"></div>
            {/* Road Markings */}
            <div className="absolute bottom-8 left-0 w-full h-1 bg-yellow-400 opacity-20"></div>
            <div className="absolute bottom-6 left-0 w-full flex justify-around">
              <div className="w-16 h-0.5 bg-white opacity-20"></div>
              <div className="w-16 h-0.5 bg-white opacity-20"></div>
              <div className="w-16 h-0.5 bg-white opacity-20"></div>
              <div className="w-16 h-0.5 bg-white opacity-20"></div>
              <div className="w-16 h-0.5 bg-white opacity-20"></div>
            </div>
          </div>
          
          {/* Street Lights */}
          <div className="absolute bottom-16 left-1/4 w-2 h-24 bg-gray-500 opacity-15">
            <div className="absolute -top-4 -left-3 w-8 h-8 bg-yellow-200 rounded-full opacity-30 blur-sm"></div>
          </div>
          <div className="absolute bottom-16 right-1/4 w-2 h-24 bg-gray-500 opacity-15">
            <div className="absolute -top-4 -left-3 w-8 h-8 bg-yellow-200 rounded-full opacity-30 blur-sm"></div>
          </div>
        </div>
        
        {/* Realistic Yulu Bikes - More Visible & Always on Screen */}
        <div className="absolute inset-0 opacity-45">
          {/* White/Grey DEX Bike - Top Left - Moving Right */}
          <div className="absolute top-16 left-12 w-56 h-56 animate-[slideRight_15s_linear_infinite]">
            <svg viewBox="0 0 300 200" fill="none" className="w-full h-full drop-shadow-2xl">
              {/* Shadow */}
              <ellipse cx="150" cy="175" rx="100" ry="12" fill="#000000" opacity="0.15"/>
              
              {/* Rear Wheel */}
              <circle cx="100" cy="145" r="28" fill="#1E293B"/>
              <circle cx="100" cy="145" r="24" fill="#374151"/>
              <circle cx="100" cy="145" r="18" fill="#1E293B"/>
              <circle cx="100" cy="145" r="8" fill="#E5E7EB"/>
              
              {/* Front Wheel */}
              <circle cx="200" cy="145" r="28" fill="#1E293B"/>
              <circle cx="200" cy="145" r="24" fill="#374151"/>
              <circle cx="200" cy="145" r="18" fill="#1E293B"/>
              <circle cx="200" cy="145" r="8" fill="#E5E7EB"/>
              
              {/* Main Body - Darker Grey with Shine */}
              <path d="M 110 120 Q 120 100 140 95 L 180 95 Q 190 100 195 120 L 185 140 L 115 140 Z" fill="#9CA3AF" stroke="#E5E7EB" strokeWidth="2" filter="drop-shadow(0 0 4px rgba(255,255,255,0.6))"/>
              
              {/* Seat */}
              <ellipse cx="125" cy="95" rx="25" ry="12" fill="#1E293B"/>
              
              {/* Front Panel */}
              <rect x="185" y="90" width="20" height="40" rx="8" fill="#F3F4F6"/>
              <circle cx="195" cy="105" r="4" fill="#E5E7EB"/>
              
              {/* Handlebars */}
              <path d="M 195 90 L 200 70 M 195 90 L 190 70" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
              <rect x="185" y="65" width="20" height="8" rx="4" fill="#374151"/>
              
              {/* Cyan Stripe */}
              <rect x="130" y="115" width="40" height="6" rx="3" fill="#06B6D4"/>
            </svg>
          </div>

          {/* Red Yulu Bike - Top Right - Moving Left (Flipped) - Delay 7.5s */}
          <div className="absolute top-20 right-16 w-52 h-52 animate-[slideLeft_15s_linear_infinite] animation-delay-[7.5s]" style={{animationDelay: '7.5s'}}>
            <svg viewBox="0 0 300 200" fill="none" className="w-full h-full drop-shadow-2xl">
              {/* Shadow */}
              <ellipse cx="150" cy="175" rx="95" ry="12" fill="#000000" opacity="0.15"/>
              
              {/* Rear Wheel */}
              <circle cx="100" cy="145" r="26" fill="#1E293B"/>
              <circle cx="100" cy="145" r="22" fill="#374151"/>
              <circle cx="100" cy="145" r="16" fill="#1E293B"/>
              <circle cx="100" cy="145" r="7" fill="#EF4444"/>
              
              {/* Front Wheel */}
              <circle cx="200" cy="145" r="26" fill="#1E293B"/>
              <circle cx="200" cy="145" r="22" fill="#374151"/>
              <circle cx="200" cy="145" r="16" fill="#1E293B"/>
              <circle cx="200" cy="145" r="7" fill="#EF4444"/>
              
              {/* Main Body - Darker Red with Shine */}
              <path d="M 110 120 Q 120 98 140 92 L 180 92 Q 192 98 197 120 L 187 140 L 115 140 Z" fill="#DC2626" stroke="#FCA5A5" strokeWidth="2" filter="drop-shadow(0 0 5px rgba(239,68,68,0.7))"/>
              
              {/* Seat */}
              <ellipse cx="125" cy="92" rx="26" ry="13" fill="#1E293B"/>
              
              {/* Front Panel */}
              <rect x="187" y="88" width="18" height="38" rx="7" fill="#B91C1C"/>
              <circle cx="196" cy="103" r="3" fill="#FEE2E2"/>
              
              {/* Handlebars */}
              <path d="M 196 88 L 202 68 M 196 88 L 190 68" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>
              <ellipse cx="196" cy="64" rx="12" ry="5" fill="#374151"/>
              
              {/* Yulu Branding */}
              <text x="150" y="118" fontSize="10" fill="white" fontWeight="bold" textAnchor="middle">yulu</text>
            </svg>
          </div>

          {/* Silver/Grey DEX Bike - Bottom Left - Moving Right - Delay 3.75s */}
          <div className="absolute bottom-20 left-16 w-60 h-60 animate-[slideRight_15s_linear_infinite]" style={{animationDelay: '3.75s'}}>
            <svg viewBox="0 0 300 200" fill="none" className="w-full h-full drop-shadow-2xl">
              {/* Shadow */}
              <ellipse cx="150" cy="175" rx="105" ry="14" fill="#000000" opacity="0.15"/>
              
              {/* Rear Wheel */}
              <circle cx="100" cy="145" r="30" fill="#1E293B"/>
              <circle cx="100" cy="145" r="26" fill="#374151"/>
              <circle cx="100" cy="145" r="20" fill="#1E293B"/>
              <circle cx="100" cy="145" r="9" fill="#06B6D4" opacity="0.8"/>
              
              {/* Front Wheel */}
              <circle cx="200" cy="145" r="30" fill="#1E293B"/>
              <circle cx="200" cy="145" r="26" fill="#374151"/>
              <circle cx="200" cy="145" r="20" fill="#1E293B"/>
              <circle cx="200" cy="145" r="9" fill="#06B6D4" opacity="0.8"/>
              
              {/* Main Body - Darker Silver with Shine */}
              <path d="M 108 118 Q 118 96 138 90 L 182 90 Q 194 96 200 118 L 190 142 L 113 142 Z" fill="#6B7280" stroke="#D1D5DB" strokeWidth="2" filter="drop-shadow(0 0 4px rgba(209,213,217,0.7))"/>
              
              {/* Metallic highlights */}
              <path d="M 115 105 L 185 105" stroke="#E5E7EB" strokeWidth="2" opacity="0.6"/>
              
              {/* Seat */}
              <ellipse cx="123" cy="90" rx="28" ry="14" fill="#1E293B"/>
              
              {/* Front Panel */}
              <rect x="190" y="86" width="22" height="42" rx="9" fill="#D1D5DB"/>
              <circle cx="201" cy="102" r="5" fill="#06B6D4"/>
              <rect x="197" y="115" width="8" height="3" rx="1.5" fill="#FBBF24"/>
              
              {/* Handlebars */}
              <path d="M 201 86 L 208 64 M 201 86 L 194 64" stroke="#1E293B" strokeWidth="4" strokeLinecap="round"/>
              <rect x="189" y="58" width="24" height="10" rx="5" fill="#374151"/>
              
              {/* Cyan Accent Stripe */}
              <rect x="128" y="112" width="48" height="8" rx="4" fill="#06B6D4"/>
              <text x="152" y="118" fontSize="9" fill="white" fontWeight="bold" textAnchor="middle">DEX</text>
            </svg>
          </div>

          {/* Cyan Yulu Bike - Bottom Right - Moving Left (Flipped) - Delay 11.25s */}
          <div className="absolute bottom-24 right-12 w-48 h-48 animate-[slideLeft_15s_linear_infinite]" style={{animationDelay: '11.25s'}}>
            <svg viewBox="0 0 300 200" fill="none" className="w-full h-full drop-shadow-2xl">
              {/* Shadow */}
              <ellipse cx="150" cy="175" rx="90" ry="11" fill="#000000" opacity="0.15"/>
              
              {/* Rear Wheel */}
              <circle cx="105" cy="145" r="25" fill="#1E293B"/>
              <circle cx="105" cy="145" r="21" fill="#374151"/>
              <circle cx="105" cy="145" r="15" fill="#1E293B"/>
              <circle cx="105" cy="145" r="6" fill="#06B6D4"/>
              
              {/* Front Wheel */}
              <circle cx="195" cy="145" r="25" fill="#1E293B"/>
              <circle cx="195" cy="145" r="21" fill="#374151"/>
              <circle cx="195" cy="145" r="15" fill="#1E293B"/>
              <circle cx="195" cy="145" r="6" fill="#06B6D4"/>
              
              {/* Main Body - Darker Cyan with Shine */}
              <path d="M 113 122 Q 122 102 140 97 L 177 97 Q 188 102 193 122 L 183 140 L 118 140 Z" fill="#0891B2" stroke="#67E8F9" strokeWidth="2" filter="drop-shadow(0 0 5px rgba(6,182,212,0.8))"/>
              
              {/* Seat */}
              <ellipse cx="127" cy="97" rx="24" ry="12" fill="#1E293B"/>
              
              {/* Front Panel */}
              <rect x="183" y="93" width="17" height="36" rx="7" fill="#0891B2"/>
              <circle cx="191.5" cy="106" r="3.5" fill="#E0F2FE"/>
              
              {/* Handlebars */}
              <path d="M 191.5 93 L 197 74 M 191.5 93 L 186 74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>
              <ellipse cx="191.5" cy="70" rx="10" ry="4" fill="#374151"/>
              
              {/* Yulu Logo on body */}
              <circle cx="130" cy="112" r="13" fill="white" opacity="0.95"/>
              <path d="M 130 105 Q 130 112 136 112 Q 130 112 130 119 Q 130 112 124 112 Q 130 112 130 105" fill="#06B6D4"/>
              
              <text x="160" y="118" fontSize="9" fill="white" fontWeight="bold" textAnchor="middle">yulu</text>
            </svg>
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
            {/* Left Side - Branding & Quote - MEDIUM BLUE */}
            <div className="bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-12 flex flex-col justify-center">
              {/* Title and Tagline - NO LOGO */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-3 text-white">
                  Yulite HRMS
                </h1>
                <p className="text-lg text-white/90">
                  Effortless workforce management.
                </p>
              </div>
              
              {/* Current Quote Display */}
              <div className="mt-auto">
                <div className="border-l-4 border-white/50 pl-4">
                  <p 
                    key={`quote-${currentQuoteIndex}`}
                    className="text-lg text-white/90 italic animate-[fadeIn_1s_ease-in]"
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
        
        @keyframes slideRight {
          0% {
            transform: translateX(-100vw);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
        
        @keyframes slideLeft {
          0% {
            transform: translateX(100vw) scaleX(-1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100vw) scaleX(-1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}