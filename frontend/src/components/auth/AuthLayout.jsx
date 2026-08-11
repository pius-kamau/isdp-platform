import { Link } from "react-router-dom";

export default function AuthLayout({
  children,
  title = "ISDP",
  showBack = false,
}) {
  return (
    <div className="min-h-screen bg-[#f7f8f7] text-[#171918]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">

        {/* Desktop Brand Panel */}
        <div className="relative hidden overflow-hidden bg-[#00B330] lg:flex lg:w-[44%]">
          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold">
                I
              </div>

              <span className="text-xl font-semibold tracking-tight">
                ISDP
              </span>
            </Link>

            {/* Main message */}
            <div className="max-w-md">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                Invisible Skills Discovery Platform
              </p>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Discover skills.
                <br />
                Connect with people.
                <br />
                Create opportunities.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-white/75">
                A community platform designed to help people discover,
                share and connect through skills, knowledge and experience.
              </p>
            </div>

            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} ISDP
            </p>
          </div>

          {/* Very subtle decorative shapes */}
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />
        </div>

        {/* Form Area */}
        <main className="flex min-h-screen flex-1 flex-col">

          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 py-6 lg:hidden">
            {showBack ? (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-sm text-gray-500 transition hover:text-gray-900"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <Link
              to="/"
              className="text-lg font-semibold tracking-tight"
            >
              ISDP
            </Link>

            <div className="w-10" />
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
            <div className="w-full max-w-[430px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}