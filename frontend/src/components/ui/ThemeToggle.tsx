import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center p-2 rounded-lg bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 transition-colors duration-200 group cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Sun Icon (visible in dark mode) */}
      <Sun
        className={`w-5 h-5 transition-all duration-300 ${
          theme === "dark"
            ? "text-yellow-400 rotate-0 scale-100"
            : "text-gray-400 rotate-90 scale-0 absolute"
        }`}
      />

      {/* Moon Icon (visible in light mode) */}
      <Moon
        className={`w-5 h-5 transition-all duration-300 ${
          theme === "light"
            ? "text-blue-400 rotate-0 scale-100"
            : "text-gray-400 -rotate-90 scale-0 absolute"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
