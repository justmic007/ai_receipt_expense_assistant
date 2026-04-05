import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: new URL(".", import.meta.url).pathname,
    resolveAlias: {
      tailwindcss: require.resolve("tailwindcss"),
    },
  },
};

export default nextConfig;