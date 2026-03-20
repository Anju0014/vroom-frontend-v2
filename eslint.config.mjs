import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
     
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // JSX / React
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      // Hooks (too noisy in large apps)
      "react-hooks/exhaustive-deps": "warn",
      // Next.js image rule
      "@next/next/no-img-element": "off",
      // Style preferences
      "prefer-const": "off",
      // Accessibility (optional)
      "jsx-a11y/alt-text": "warn",
    },
  }
];
export default eslintConfig;
