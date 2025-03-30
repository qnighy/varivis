import type { MetadataRoute } from 'next';
import iconSvgImage from './icon.svg';
import icon144x144Image from './icon-144x144.png';
import screenshotDesktop from './screenshot-desktop.png';
import screenshotMobile from './screenshot-mobile.png';
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
        src: iconSvgImage.src,
        sizes: `${iconSvgImage.width}x${iconSvgImage.height}`,
        type: 'image/svg',
      },
      {
        src: icon144x144Image.src,
        sizes: `${icon144x144Image.width}x${icon144x144Image.height}`,
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: screenshotDesktop.src,
        sizes: `${screenshotDesktop.width}x${screenshotDesktop.height}`,
        type: 'image/png',
        form_factor: 'wide',
        label: 'Väri Vis! on Desktop',
      },
      {
        src: screenshotMobile.src,
        sizes: `${screenshotMobile.width}x${screenshotMobile.height}`,
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Väri Vis! on Mobile',
      },
    ],
  }
}
