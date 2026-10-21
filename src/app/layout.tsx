import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'PureClip - Baixar Vídeos do Instagram & TikTok Sem Marca d\'Água | Limpador de Metadados',
  description:
    'Áreas dedicadas para baixar do Instagram (Reels e Posts) e do TikTok (HD Sem Marca d\'Água), removendo 100% dos metadados e EXIF para repostar sem penalização.',
  keywords: [
    'pureclip',
    'instagram downloader',
    'tiktok downloader sem marca de agua',
    'tiktok no watermark',
    'remover metadados video',
    'limpar exif video',
    'instagram to tiktok',
    'tiktok to reels',
    'video sem metadados',
    'repost reels sem penalizacao',
  ],
  authors: [{ name: 'PureClip Studio' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="bg-glow-container" aria-hidden="true">
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="glow-orb glow-orb-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
