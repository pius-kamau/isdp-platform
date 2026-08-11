export default function Logo({ size = "md", showText = true }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-14 w-14 text-xl",
    xl: "h-20 w-20 text-3xl",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-xl bg-[#00B330] flex items-center justify-center text-white font-bold`}>
        I
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-[#00B330] tracking-tight`}>
          ISDP
        </span>
      )}
    </div>
  );
}