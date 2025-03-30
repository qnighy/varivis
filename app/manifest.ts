import type { MetadataRoute } from 'next';
import nextConfig from '../next.config.mjs';

const BASE_PATH = nextConfig.basePath ?? '';

export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Väri Vis!",
    short_name: 'VariVis',
    description: "Väri Vis! is a camera app with a special filter to emphasize colors using monochromatic patterns, primarily for colorblind users.",
    start_url: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: `${BASE_PATH}/icon.svg`,
        sizes: '192x192',
        type: 'image/svg',
      },
    ],
  }
}
