"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap, MonitorPlay } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginAction } from "@/server/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);

      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
        return;
      }
      
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050505] relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0">
        <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-8 py-8">
        
        <div className="hidden lg:flex w-1/2 flex-col justify-center pr-8">
          <div className="mb-6">
            <img src="/logo.png" alt="MALIX Logo" className="h-12 w-auto object-contain mb-3" />
            <div className="text-zinc-400 text-[9px] tracking-[0.2em] font-medium flex items-center gap-2">
              MOVIES <span className="w-1 h-1 rounded-full bg-yellow-500" /> 
              DRAMAS <span className="w-1 h-1 rounded-full bg-yellow-500" /> 
              SERIES <span className="w-1 h-1 rounded-full bg-yellow-500" /> 
              STORIES
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
            Your Next <br />
            <span className="text-yellow-500">Favorite Story</span> <br />
            Is Here
          </h1>
          
          <p className="text-zinc-400 text-xs xl:text-sm max-w-sm leading-relaxed mb-6">
            Stream unlimited movies, dramas, series and stories — anytime, anywhere.
          </p>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-center justify-center">
          
          <div className="w-full max-w-[500px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold text-white mb-1">Welcome <span className="text-yellow-500">Back</span></h2>
              <p className="text-[10px] text-zinc-400">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full bg-[#151515] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 text-[11px]"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    className="w-full bg-[#151515] border border-white/10 rounded-lg py-2 pl-9 pr-9 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] py-1">
                <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded border border-yellow-500 bg-[#151515] flex items-center justify-center">
                    <input type="checkbox" className="hidden" />
                    <svg className="w-2 h-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  Remember me
                </label>
                <Link href="#" className="text-yellow-500 hover:text-yellow-400 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition-all disabled:opacity-70 text-[11px] mt-1"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <><ArrowRight size={12} /> Login</>}
              </button>
            </form>

            <div className="flex items-center gap-2 my-3">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[8px] text-zinc-500 uppercase tracking-wide">Or continue with</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button 
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-2 bg-[#151515] border border-white/10 hover:bg-white/5 text-white py-2.5 rounded-lg transition-all text-[10px] font-medium"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
              <div className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-yellow-500 transition-colors cursor-pointer">
                <ShieldCheck size={10} />
                <span className="text-[6px] font-medium">Secure</span>
              </div>
              <div className="w-px h-2 bg-white/5" />
              <div className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-yellow-500 transition-colors cursor-pointer">
                <Zap size={10} />
                <span className="text-[6px] font-medium">Fast Streaming</span>
              </div>
              <div className="w-px h-2 bg-white/5" />
              <div className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-yellow-500 transition-colors cursor-pointer">
                <MonitorPlay size={10} />
                <span className="text-[6px] font-medium">All Devices</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center text-[9px] text-zinc-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}