import svgLoader from "vite-svg-loader";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nosana Stake',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'theme-color', content: '#10E80C' },
        { name: 'apple-mobile-web-app-title', content: 'Nosana Stake' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/_nuxt/manifest.webmanifest' },
      ],
    },
  },
  devtools: { enabled: true },
  ssr: false,
  css: [
    "~/assets/styles/global.scss",
  ],
  dir: {
    public: "static",
  },
  pwa: {
    manifest: {
      name: "Nosana Stake",
      short_name: "Nosana Stake",
      theme_color: "#10E80C",
      background_color: "#ffffff",
      display: "standalone",
      description: "Nosana Staking Platform",
      start_url: "/",
      scope: "/",
      icons: [
        {
          src: "/web-app-manifest-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/web-app-manifest-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },
  modules: [
    "@nuxtjs/google-fonts",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "nuxt-gtag",
    "@vite-pwa/nuxt",
  ],
  googleFonts: {
    preload: true,
    families: {
      Outfit: [300, 400, 700],
      "Space Grotesk": [400],
    },
  },
  colorMode: {
    preference: "light", // default value of $colorMode.preference
    fallback: "light", // fallback value if not system preference found
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "-mode",
    storageKey: "nuxt-color-mode",
    dataValue: "theme",
  },
  runtimeConfig: {
    public: {
      rpcUrl: process.env.RPC_URL,
      apiBase: process.env.API_BASE,
      network: process.env.NETWORK || "mainnet",
    },
  },
  gtag: {
    enabled: process.env.NODE_ENV === "production",
    id: "G-HNDP62SH8M",
  },
  vite: {
    esbuild: {
      target: "esnext",
    },
    plugins: [
      svgLoader({
        defaultImport: "url",
        svgo: false
      }),
      nodePolyfills({
        // To exclude specific polyfills, add them to this list.
        exclude: [
          "fs", // Excludes the polyfill for `fs` and `node:fs`.
        ],
        // Whether to polyfill specific globals.
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          global: true,
          process: true,
        },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: {
        stream: "rollup-plugin-node-polyfills/polyfills/stream",
        events: "rollup-plugin-node-polyfills/polyfills/events",
      },
    },
    optimizeDeps: {
      include: ["@solana/web3.js", "buffer"],
      exclude: ["vue-demi", "react", "react-dom", "react/jsx-runtime"],
      esbuildOptions: {
        target: "esnext",
        define: {
          global: "globalThis",
        },
      },
    },
    define: {
      "process.env.BROWSER": true,
    },
    build: {
      target: "esnext",
      reportCompressedSize: false,
      rollupOptions: {
        external: ["react", "react-dom"],
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          sourceMap: false,
          additionalData: '@use "@/assets/styles/variables.scss" as *;',
          silenceDeprecations: ["slash-div"],
        },
      },
    },
    devBundler: "legacy",
    server: {
      watch: {
        usePolling: true,
        interval: 300,
      },
    },
  },
  components: true,
});
