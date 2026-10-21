import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface TikTokExtractedMedia {
  url: string;
  type: 'video';
  title?: string;
  author?: string;
  authorHandle?: string;
  cover?: string;
  duration?: number;
  wmUrl?: string;
  musicTitle?: string;
  source: string;
}

// Follow redirects for shortened TikTok URLs (vt.tiktok.com / vm.tiktok.com)
async function resolveTikTokRedirect(rawUrl: string): Promise<string> {
  try {
    const res = await fetch(rawUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
    });
    return res.url || rawUrl;
  } catch {
    return rawUrl;
  }
}

// Strategy 1: TikWM Cloud API (Fast, reliable, Watermark-Free & HD)
async function tryTikWM(targetUrl: string, preferHd = true): Promise<TikTokExtractedMedia | null> {
  const endpoints = ['https://www.tikwm.com/api/', 'https://tikwm.com/api/'];

  for (const endpoint of endpoints) {
    try {
      const fullEndpoint = `${endpoint}?url=${encodeURIComponent(targetUrl)}${preferHd ? '&hd=1' : ''}`;
      const res = await fetch(fullEndpoint, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) continue;
      const data = await res.json();

      if (data?.code === 0 && data.data) {
        const item = data.data;
        const videoUrl = (preferHd && item.hdplay) || item.play || item.wmplay;

        if (videoUrl) {
          return {
            url: videoUrl,
            type: 'video',
            title: item.title || 'tiktok_video',
            author: item.author?.nickname || 'TikTok Creator',
            authorHandle: item.author?.unique_id || '',
            cover: item.cover,
            duration: item.duration,
            wmUrl: item.wmplay,
            musicTitle: item.music_info?.title || item.music,
            source: 'tikwm-watermark-free',
          };
        }
      }
    } catch (err: any) {
      console.warn(`TikWM endpoint ${endpoint} failed:`, err.message);
    }
  }

  return null;
}

// Strategy 2: yt-dlp local fallback if available
async function tryTikTokYtDlp(targetUrl: string): Promise<TikTokExtractedMedia | null> {
  try {
    const { stdout } = await execPromise(
      `yt-dlp -g --no-warnings -f "best[ext=mp4]/best" "${targetUrl}"`,
      { timeout: 9000 }
    );
    const lines = stdout.trim().split('\n').filter(Boolean);
    if (lines.length > 0 && lines[0].startsWith('http')) {
      return {
        url: lines[0].trim(),
        type: 'video',
        title: 'tiktok_video.mp4',
        source: 'yt-dlp-engine',
      };
    }
  } catch {
    // yt-dlp failed or not configured for tiktok challenge
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url?.trim();
    const preferHd = body.hd !== false;

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'Por favor, insira o link do vídeo do TikTok.' },
        { status: 400 }
      );
    }

    const isTikTok =
      rawUrl.includes('tiktok.com') ||
      rawUrl.includes('douyin.com') ||
      rawUrl.includes('tikwm.com');

    if (!isTikTok) {
      return NextResponse.json(
        { error: 'Link inválido. O endereço deve ser do TikTok (ex: tiktok.com ou vm.tiktok.com).' },
        { status: 400 }
      );
    }

    // Resolve short links if user copied from mobile app (vt.tiktok.com / vm.tiktok.com)
    let finalUrl = rawUrl;
    if (rawUrl.includes('vm.tiktok.com') || rawUrl.includes('vt.tiktok.com')) {
      finalUrl = await resolveTikTokRedirect(rawUrl);
    }

    // Strategy 1: TikWM (Watermark-free HD extraction)
    const tikwmResult = await tryTikWM(finalUrl, preferHd);
    if (tikwmResult) {
      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        media: tikwmResult,
        proxyUrl: `/api/proxy?url=${encodeURIComponent(tikwmResult.url)}`,
      });
    }

    // Strategy 2: yt-dlp local engine
    const ytDlpResult = await tryTikTokYtDlp(finalUrl);
    if (ytDlpResult) {
      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        media: ytDlpResult,
        proxyUrl: `/api/proxy?url=${encodeURIComponent(ytDlpResult.url)}`,
      });
    }

    // If both failed, provide friendly guidance and direct upload fallback
    return NextResponse.json(
      {
        success: false,
        requiresFallback: true,
        error: 'Não foi possível extrair o vídeo do TikTok automaticamente.',
        help: 'O vídeo pode estar privado ou temporariamente restrito. Você pode fazer o upload direto do arquivo (.mp4/.mov) para purificar os metadados instantaneamente!',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Erro na API TikTok:', err);
    return NextResponse.json(
      { error: 'Erro ao processar vídeo do TikTok.', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Parâmetro url é obrigatório' }, { status: 400 });
  }

  const fakeReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  return POST(fakeReq);
}
