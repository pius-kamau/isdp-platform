import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#00B330] text-3xl font-bold text-white mb-6 shadow-lg shadow-[#00B330]/20">
          I
        </div>

        <h1 className="text-4xl font-bold text-[#00B330] tracking-tight">ISDP</h1>
        <p className="text-gray-500 text-sm mt-1 tracking-wide">Invisible Skills Discovery Platform</p>

        <div className="mt-10 max-w-sm">
          <h2 className="text-2xl font-semibold text-gray-900 leading-snug">
            Discover skills.
            <br />
            Connect with people.
            <br />
            Create opportunities.
          </h2>

          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            A community platform designed to help people discover,
            share and connect through skills, knowledge and experience.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-10 w-full max-w-sm space-y-3">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#00B330] text-white rounded-xl font-medium hover:bg-[#009f2b] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/register"
            className="flex items-center justify-center w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-[#00B330] hover:text-[#00B330] transition-all duration-200"
          >
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-[#00B330]">1K+</div>
            <div className="text-xs text-gray-500 mt-0.5">Members</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#00B330]">500+</div>
            <div className="text-xs text-gray-500 mt-0.5">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#00B330]">100+</div>
            <div className="text-xs text-gray-500 mt-0.5">Mentors</div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-gray-400">
          © {new Date().getFullYear()} ISDP. All rights reserved.
        </p>
      </div>
    </div>
  );
}