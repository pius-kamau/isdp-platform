import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { registerUser } from "../../services/auth.service";
import { COUNTIES, SUB_COUNTIES } from "../../data/counties";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    county: "",
    subCounty: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset subCounty when county changes
    if (name === "county") {
      setForm((prev) => ({
        ...prev,
        county: value,
        subCounty: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (error) {
      setError("");
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await registerUser(form);
      console.log("Registration response:", response);
      
      navigate("/verify-email", {
        state: {
          email: form.email,
        },
      });
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const fieldErrorMap = {};
        errors.forEach((e) => {
          const field = e.field.replace('body.', '');
          fieldErrorMap[field] = e.message;
        });
        setFieldErrors(fieldErrorMap);
        setError("Please fix the errors below.");
      } else {
        const message =
          err?.response?.data?.message ||
          "Unable to create your account. Please try again.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const subCounties = form.county ? SUB_COUNTIES[form.county] || [] : [];

  return (
    <div className="min-h-screen bg-[#f7f8f7] flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold text-[#00B330] ml-1">ISDP</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join ISDP and start discovering skills in your community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Full Name *
              </label>
              <div className="relative">
                <UserRound
                  size={17}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className={`h-12 w-full rounded-xl border ${
                    fieldErrors.fullName ? 'border-red-500' : 'border-gray-200'
                  } bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`h-12 w-full rounded-xl border ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                  } bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="0712345678"
                className={`h-12 w-full rounded-xl border ${
                  fieldErrors.phone ? 'border-red-500' : 'border-gray-200'
                } bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            {/* County */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                County *
              </label>
              <select
                name="county"
                value={form.county}
                onChange={handleChange}
                required
                className={`h-12 w-full rounded-xl border ${
                  fieldErrors.county ? 'border-red-500' : 'border-gray-200'
                } bg-white px-4 text-sm outline-none transition focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10`}
              >
                <option value="">Select your county</option>
                {COUNTIES.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
              {fieldErrors.county && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.county}</p>
              )}
            </div>

            {/* Sub-County */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Sub-County
              </label>
              <select
                name="subCounty"
                value={form.subCounty}
                onChange={handleChange}
                disabled={!form.county}
                className={`h-12 w-full rounded-xl border ${
                  fieldErrors.subCounty ? 'border-red-500' : 'border-gray-200'
                } bg-white px-4 text-sm outline-none transition focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {form.county ? 'Select your sub-county' : 'Select county first'}
                </option>
                {subCounties.map((subCounty) => (
                  <option key={subCounty} value={subCounty}>{subCounty}</option>
                ))}
              </select>
              {fieldErrors.subCounty && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.subCounty}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Password *
              </label>
              <div className="relative">
                <LockKeyhole
                  size={17}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className={`h-12 w-full rounded-xl border ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-200'
                  } bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#00B330] focus:ring-2 focus:ring-[#00B330]/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#00B330]"
              />
              <span className="text-xs leading-5 text-gray-500">
                I agree to the ISDP terms of service and privacy policy.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B330] text-sm font-medium text-white transition hover:bg-[#009f2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={17} />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#00A62C] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}