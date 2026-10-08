import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ripple",
    short_name: "Ripple",
    description: "Stay hydrated, one reminder at a time.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffdfa",
    theme_color: "#409e9e",
    icons: [
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
