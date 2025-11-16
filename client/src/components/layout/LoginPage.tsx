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
      {/* Professional Background - Vibrant City View */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-sky-100 to-slate-100">
        {/* Isometric City Background */}
        <div className="absolute inset-0 opacity-60">
          {/* Buildings - Top Left */}
          <svg className="absolute top-0 left-0 w-64 h-80" viewBox="0 0 200 250" fill="none">
            {/* Tall Building 1 */}
            <path d="M 40 80 L 70 60 L 70 20 L 40 40 Z" fill="#E2E8F0"/>
            <path d="M 70 60 L 100 80 L 100 40 L 70 20 Z" fill="#CBD5E1"/>
            <path d="M 40 80 L 70 60 L 100 80 L 70 100 Z" fill="#F1F5F9"/>
            {/* Windows */}
            <rect x="48" y="50" width="6" height="8" fill="#94A3B8" opacity="0.4"/>
            <rect x="58" y="50" width="6" height="8" fill="#94A3B8" opacity="0.4"/>
            <rect x="78" y="50" width="6" height="8" fill="#94A3B8" opacity="0.4"/>
            <rect x="88" y="50" width="6" height="8" fill="#94A3B8" opacity="0.4"/>
            
            {/* Building 2 */}
            <path d="M 120 100 L 150 80 L 150 50 L 120 70 Z" fill="#E2E8F0"/>
            <path d="M 150 80 L 180 100 L 180 70 L 150 50 Z" fill="#CBD5E1"/>
            <path d="M 120 100 L 150 80 L 180 100 L 150 120 Z" fill="#F1F5F9"/>
          </svg>

          {/* Buildings - Top Right */}
          <svg className="absolute top-0 right-0 w-64 h-80" viewBox="0 0 200 250" fill="none">
            {/* Building 3 */}
            <path d="M 20 90 L 50 70 L 50 30 L 20 50 Z" fill="#E2E8F0"/>
            <path d="M 50 70 L 80 90 L 80 50 L 50 30 Z" fill="#CBD5E1"/>
            <path d="M 20 90 L 50 70 L 80 90 L 50 110 Z" fill="#F1F5F9"/>
            
            {/* Building 4 */}
            <path d="M 100 110 L 130 90 L 130 60 L 100 80 Z" fill="#E2E8F0"/>
            <path d="M 130 90 L 160 110 L 160 80 L 130 60 Z" fill="#CBD5E1"/>
            <path d="M 100 110 L 130 90 L 160 110 L 130 130 Z" fill="#F1F5F9"/>
          </svg>

          {/* Roads and Parks - Center */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" fill="none">
            {/* Diagonal Roads */}
            <path d="M 0 300 L 400 100 L 600 200 L 1000 0" stroke="#CBD5E1" strokeWidth="80" opacity="0.3"/>
            <path d="M 0 400 L 300 250 L 700 450 L 1000 300" stroke="#CBD5E1" strokeWidth="80" opacity="0.3"/>
            
            {/* Road Markings */}
            <path d="M 100 350 L 300 240" stroke="white" strokeWidth="3" strokeDasharray="20,15" opacity="0.4"/>
            <path d="M 400 400 L 700 250" stroke="white" strokeWidth="3" strokeDasharray="20,15" opacity="0.4"/>
            
            {/* Green Parks */}
            <ellipse cx="200" cy="450" rx="80" ry="40" fill="#86EFAC" opacity="0.5"/>
            <ellipse cx="750" cy="350" rx="90" ry="45" fill="#86EFAC" opacity="0.5"/>
            <ellipse cx="450" cy="500" rx="70" ry="35" fill="#86EFAC" opacity="0.5"/>
            
            {/* Trees */}
            <circle cx="180" cy="440" r="12" fill="#22C55E" opacity="0.6"/>
            <circle cx="220" cy="460" r="10" fill="#22C55E" opacity="0.6"/>
            <circle cx="730" cy="340" r="14" fill="#22C55E" opacity="0.6"/>
            <circle cx="770" cy="360" r="11" fill="#22C55E" opacity="0.6"/>
            
            {/* Water Pond */}
            <ellipse cx="850" cy="480" rx="60" ry="35" fill="#93C5FD" opacity="0.5"/>
            <ellipse cx="850" cy="480" rx="40" ry="22" fill="#BFDBFE" opacity="0.6"/>
          </svg>

          {/* Buildings - Bottom Left */}
          <svg className="absolute bottom-0 left-0 w-72 h-64" viewBox="0 0 220 200" fill="none">
            {/* Small Building */}
            <path d="M 30 120 L 60 100 L 60 80 L 30 100 Z" fill="#E2E8F0"/>
            <path d="M 60 100 L 90 120 L 90 100 L 60 80 Z" fill="#CBD5E1"/>
            <path d="M 30 120 L 60 100 L 90 120 L 60 140 Z" fill="#F1F5F9"/>
            
            {/* Medium Building */}
            <path d="M 110 140 L 140 120 L 140 90 L 110 110 Z" fill="#E2E8F0"/>
            <path d="M 140 120 L 170 140 L 170 110 L 140 90 Z" fill="#CBD5E1"/>
            <path d="M 110 140 L 140 120 L 170 140 L 140 160 Z" fill="#F1F5F9"/>
          </svg>

          {/* Buildings - Bottom Right */}
          <svg className="absolute bottom-0 right-0 w-72 h-64" viewBox="0 0 220 200" fill="none">
            {/* Building Group */}
            <path d="M 40 130 L 70 110 L 70 85 L 40 105 Z" fill="#E2E8F0"/>
            <path d="M 70 110 L 100 130 L 100 105 L 70 85 Z" fill="#CBD5E1"/>
            <path d="M 40 130 L 70 110 L 100 130 L 70 150 Z" fill="#F1F5F9"/>
            
            <path d="M 130 145 L 160 125 L 160 95 L 130 115 Z" fill="#E2E8F0"/>
            <path d="M 160 125 L 190 145 L 190 115 L 160 95 Z" fill="#CBD5E1"/>
            <path d="M 130 145 L 160 125 L 190 145 L 160 165 Z" fill="#F1F5F9"/>
          </svg>
        </div>
        
        {/* Realistic Yulu Bikes - Moving on Road at Bottom */}
        <div className="absolute inset-0 opacity-50">
          {/* White/Grey DEX Bike - Bottom Road - Moving Right */}
          <div className="absolute bottom-24 left-12 w-56 h-56 animate-[slideRight_15s_linear_infinite]">
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

          {/* Red Yulu Bike - Bottom Road - Moving Left (Flipped) - Delay 7.5s */}
          <div className="absolute bottom-28 right-16 w-52 h-52 animate-[slideLeft_15s_linear_infinite] animation-delay-[7.5s]" style={{animationDelay: '7.5s'}}>
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

          {/* Silver/Grey DEX Bike - Bottom Road - Moving Right - Delay 3.75s */}
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

          {/* Cyan Yulu Bike - Bottom Road - Moving Left (Flipped) - Delay 11.25s */}
          <div className="absolute bottom-20 right-12 w-48 h-48 animate-[slideLeft_15s_linear_infinite]" style={{animationDelay: '11.25s'}}>
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