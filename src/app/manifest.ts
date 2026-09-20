import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TecNutre - Gestão de abate e manejo",
    short_name: "TecNutre",
    description: "Gestão de abate e manejo",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [{ src: "/icon-mobile.png", sizes: "1254x1254", type: "image/png" }],
  };
}
