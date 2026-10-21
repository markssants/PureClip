'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Link2,
  Upload,
  ShieldCheck,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileVideo,
  Copy,
  RotateCcw,
  Layers,
  Clock,
  MapPin,
  Cpu,
  Zap,
  Share2,
  Film,
  Smartphone,
  Check,
} from 'lucide-react';
import { cleanMp4Metadata, CleanResult } from '@/lib/mp4Cleaner';

type PlatformArea = 'instagram' | 'tiktok' | 'file';
type ProcessingStep = 'idle' | 'fetching' | 'inspecting' | 'stripping' | 'ready' | 'error';
type FileSubTab = 'upload' | 'direct';

// SVG Icons for authentic brand visual identity
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.684 2.896 2.896 0 0 1-2.896-2.896 2.896 2.896 0 0 1 2.896-2.896c.382 0 .744.07 1.077.2v-3.52a6.34 6.34 0 0 0-1.077-.093 6.341 6.341 0 0 0-6.34 6.34 6.341 6.341 0 0 0 6.34 6.34 6.341 6.341 0 0 0 6.34-6.34V9.012a8.21 8.21 0 0 0 4.762 1.503v-3.51a4.8 4.8 0 0 1-1.000-.319z" />
  </svg>
);

export default function Home() {
  // Platform Areas
  const [platformArea, setPlatformArea] = useState<PlatformArea>('instagram');

  // Inputs
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [directVideoUrl, setDirectVideoUrl] = useState('');
  const [preferHd, setPreferHd] = useState(true);
  const [fileSubTab, setFileSubTab] = useState<FileSubTab>('upload');

  // Pipeline State
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [requiresFallback, setRequiresFallback] = useState(false);
  const [fallbackHelp, setFallbackHelp] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Results & Source Tracking
  const [sourcePlatform, setSourcePlatform] = useState<PlatformArea>('instagram');
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null);
  const [cleanVideoUrl, setCleanVideoUrl] = useState<string | null>(null);
  const [originalVideoName, setOriginalVideoName] = useState('video.mp4');
  const [videoMeta, setVideoMeta] = useState<{
    title?: string;
    author?: string;
    authorHandle?: string;
    cover?: string;
  } | null>(null);

  // Settings
  const [cameraStyle, setCameraStyle] = useState<'iphone' | 'android'>('iphone');
  const [isDragActive, setIsDragActive] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard Paste Helper
  const handlePaste = async (target: 'instagram' | 'tiktok' | 'direct') => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (target === 'instagram') setInstagramUrl(text.trim());
        if (target === 'tiktok') setTiktokUrl(text.trim());
        if (target === 'direct') setDirectVideoUrl(text.trim());

        setCopiedField(target);
        setTimeout(() => setCopiedField(null), 1500);
      }
    } catch {
      alert('Permissão de colar negada pelo navegador.');
    }
  };

  // Check Web Share API capability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const testFile = new File([''], 'test.mp4', { type: 'video/mp4' });
        if (navigator.canShare && navigator.canShare({ files: [testFile] })) {
          setCanShare(true);
        }
      } catch {
        setCanShare(false);
      }
    }
  }, []);

  // Process Video Buffer locally through mp4Cleaner
  const processVideoBuffer = async (
    arrayBuffer: ArrayBuffer,
    filename: string,
    platform: PlatformArea,
    style = cameraStyle
  ) => {
    setStep('inspecting');
    setStatusMessage(
      platform === 'tiktok'
        ? 'Examinando stream MP4 sem marca d’água e assinaturas ByteDance...'
        : 'Examinando estrutura binária de átomos MP4, udta e EXIF da Meta...'
    );

    await new Promise((resolve) => setTimeout(resolve, 350));

    setStep('stripping');
    setStatusMessage(
      platform === 'tiktok'
        ? 'Excluindo tags de criador TikTok, átomos udta e injetando salt inédito...'
        : 'Excluindo átomos udta, GPS, tags de origem e redefinindo carimbos...'
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const result = cleanMp4Metadata(arrayBuffer, style);
      setCleanResult(result);
      setSourcePlatform(platform);

      const blob = new Blob([result.cleanedBuffer as any], { type: 'video/mp4' });
      const objectUrl = URL.createObjectURL(blob);
      setCleanVideoUrl(objectUrl);
      setOriginalVideoName(filename);

      setStep('ready');
      setStatusMessage('Vídeo purificado com sucesso! 100% livre de rastros.');
    } catch (err: any) {
      console.error('Erro ao purificar vídeo:', err);
      setStep('error');
      setErrorMessage('Falha ao processar a estrutura do vídeo: ' + err.message);
    }
  };

  // Submit Instagram Link
  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramUrl.trim()) return;

    setStep('fetching');
    setErrorMessage('');
    setRequiresFallback(false);
    setStatusMessage('Localizando vídeo nos servidores do Instagram...');

    try {
      const response = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: instagramUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok || (data.error && !data.requiresFallback)) {
        throw new Error(data.error || 'Falha ao buscar vídeo do Instagram.');
      }

      if (data.requiresFallback) {
        setRequiresFallback(true);
        setFallbackHelp(data.help);
        setStep('idle');
        return;
      }

      if (!data.media?.url && !data.proxyUrl) {
        throw new Error('Nenhum fluxo de vídeo foi detectado para este link.');
      }

      setVideoMeta({
        title: data.media.title || 'Instagram Reel',
        author: data.media.author || 'Instagram Creator',
        cover: data.media.thumbnail,
      });

      setStatusMessage('Baixando fluxo de vídeo e preparando purificação...');

      const videoFetchUrl = data.proxyUrl || data.media.url;
      const videoRes = await fetch(videoFetchUrl);

      if (!videoRes.ok) {
        throw new Error(`Falha ao obter os dados do vídeo: ${videoRes.statusText}`);
      }

      const buffer = await videoRes.arrayBuffer();
      const filename = data.shortcode ? `instagram_${data.shortcode}.mp4` : 'instagram_video.mp4';
      await processVideoBuffer(buffer, filename, 'instagram');
    } catch (err: any) {
      console.error('Erro no Instagram:', err);
      setStep('error');
      setErrorMessage(
        err.message || 'Não foi possível baixar o vídeo do Instagram. Você pode usar a aba de Arquivo Local!'
      );
    }
  };

  // Submit TikTok Link
  const handleTikTokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiktokUrl.trim()) return;

    setStep('fetching');
    setErrorMessage('');
    setRequiresFallback(false);
    setStatusMessage('Buscando vídeo do TikTok e removendo marca d’água (HD)...');

    try {
      const response = await fetch('/api/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim(), hd: preferHd }),
      });

      const data = await response.json();

      if (!response.ok || (data.error && !data.requiresFallback)) {
        throw new Error(data.error || 'Falha ao baixar vídeo do TikTok.');
      }

      if (data.requiresFallback) {
        setRequiresFallback(true);
        setFallbackHelp(data.help);
        setStep('idle');
        return;
      }

      if (!data.media?.url && !data.proxyUrl) {
        throw new Error('Nenhum fluxo de vídeo sem marca d’água foi localizado.');
      }

      setVideoMeta({
        title: data.media.title || 'TikTok Video',
        author: data.media.author || 'TikTok Creator',
        authorHandle: data.media.authorHandle,
        cover: data.media.cover,
      });

      setStatusMessage('Baixando vídeo sem marca d’água em alta definição...');

      const videoFetchUrl = data.proxyUrl || data.media.url;
      const videoRes = await fetch(videoFetchUrl);

      if (!videoRes.ok) {
        throw new Error(`Falha ao transferir os dados do vídeo: ${videoRes.statusText}`);
      }

      const buffer = await videoRes.arrayBuffer();
      const safeId = data.media.authorHandle ? `tiktok_${data.media.authorHandle}.mp4` : 'tiktok_video.mp4';
      await processVideoBuffer(buffer, safeId, 'tiktok');
    } catch (err: any) {
      console.error('Erro no TikTok:', err);
      setStep('error');
      setErrorMessage(
        err.message || 'Não foi possível extrair o vídeo do TikTok. Verifique se o vídeo não é privado.'
      );
    }
  };

  // Submit Direct Video Link
  const handleDirectUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directVideoUrl.trim()) return;

    setStep('fetching');
    setErrorMessage('');
    setStatusMessage('Carregando fluxo de vídeo direto...');

    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(directVideoUrl.trim())}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Não foi possível obter o vídeo desta URL.');

      const buffer = await res.arrayBuffer();
      await processVideoBuffer(buffer, 'direct_video.mp4', 'file');
    } catch (err: any) {
      setStep('error');
      setErrorMessage(err.message || 'Erro ao carregar link de vídeo.');
    }
  };

  // Submit File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.includes('video') && !file.name.match(/\.(mp4|mov|m4v)$/i)) {
      setErrorMessage('Por favor, selecione um arquivo de vídeo válido (.mp4 ou .mov).');
      return;
    }

    setStep('fetching');
    setErrorMessage('');
    setStatusMessage('Carregando arquivo de vídeo...');

    try {
      const buffer = await file.arrayBuffer();
      await processVideoBuffer(buffer, file.name, 'file');
    } catch (err: any) {
      setStep('error');
      setErrorMessage('Erro ao ler arquivo: ' + err.message);
    }
  };

  // Reset to clean another video
  const handleReset = (targetPlatform?: PlatformArea) => {
    if (cleanVideoUrl) {
      URL.revokeObjectURL(cleanVideoUrl);
    }
    setCleanResult(null);
    setCleanVideoUrl(null);
    setStep('idle');
    setErrorMessage('');
    setRequiresFallback(false);
    setVideoMeta(null);

    if (targetPlatform) {
      setPlatformArea(targetPlatform);
    }
  };

  // Direct save via File System Access API
  const handleDownloadClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cleanResult) return;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      e.preventDefault();
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: cleanResult.recommendedFilename,
          types: [
            {
              description: 'Vídeo MP4 Limpo',
              accept: { 'video/mp4': ['.mp4'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(cleanResult.cleanedBuffer);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (cleanVideoUrl) {
          const a = document.createElement('a');
          a.href = cleanVideoUrl;
          a.download = cleanResult.recommendedFilename;
          a.click();
        }
      }
    }
  };

  // Native mobile share
  const handleShare = async () => {
    if (!cleanResult) return;
    try {
      const file = new File(
        [cleanResult.cleanedBuffer as any],
        cleanResult.recommendedFilename,
        { type: 'video/mp4' }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: cleanResult.recommendedFilename,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
    }
  };

  return (
    <main className="app-container">
      {/* Dynamic Header Section */}
      <header className="header">
        <div className="brand-badge">
          <span className="brand-badge-dot" />
          {platformArea === 'instagram' && (
            <span>PureClip • Módulo Instagram Reels Ativo</span>
          )}
          {platformArea === 'tiktok' && (
            <span>PureClip • Módulo TikTok Sem Marca d’Água Ativo</span>
          )}
          {platformArea === 'file' && (
            <span>PureClip • Módulo Upload Direto Ativo</span>
          )}
        </div>

        {platformArea === 'instagram' && (
          <>
            <h1 className="main-title">
              Baixe do <span className="gradient-text-insta">Instagram</span> & Deixe o Vídeo{' '}
              <span className="gradient-text-clean">100% RAW</span>
            </h1>
            <p className="subtitle">
              Elimina metadados da Meta, identificadores do Reel e tags de CDN para você repostar no TikTok, Shorts
              ou Reels sem penalizações ou redução de alcance.
            </p>
          </>
        )}

        {platformArea === 'tiktok' && (
          <>
            <h1 className="main-title">
              Baixe do <span className="gradient-text-tiktok">TikTok</span> Sem Marca d’Água &{' '}
              <span className="gradient-text-clean">100% RAW</span>
            </h1>
            <p className="subtitle">
              Baixa em alta definição sem marca d’água (No Watermark HD) e purifica os átomos de identificação da
              ByteDance para repostar no Instagram Reels sem ser derrubado.
            </p>
          </>
        )}

        {platformArea === 'file' && (
          <>
            <h1 className="main-title">
              Purificador de Vídeo <span className="gradient-text-clean">100% RAW</span>
            </h1>
            <p className="subtitle">
              Arraste qualquer arquivo MP4 ou MOV para expurgar instantaneamente geolocalização, EXIF, tags de origem e
              gerar um salt criptográfico exclusivo anti-duplicidade.
            </p>
          </>
        )}
      </header>

      {/* PLATFORM DEDICATED AREAS SELECTOR (Instagram vs TikTok vs Arquivo) */}
      <section aria-label="Seleção de Área de Download" className="platform-selector-bar">
        {/* Card 1: Área Instagram */}
        <button
          type="button"
          id="select-instagram-area-btn"
          className={`platform-tab-card ${platformArea === 'instagram' ? 'active-instagram' : ''}`}
          onClick={() => {
            setPlatformArea('instagram');
            setErrorMessage('');
            setRequiresFallback(false);
          }}
        >
          <div className="platform-card-top">
            <div className="platform-card-icon icon-insta-bg">
              <InstagramIcon size={22} />
            </div>
            <span className="platform-card-badge badge-insta">Reels & Posts</span>
          </div>
          <div>
            <div className="platform-card-title">
              <span>Área Instagram</span>
              {platformArea === 'instagram' && <span className="active-indicator-dot dot-insta" />}
            </div>
            <p className="platform-card-desc">
              Baixe Reels e Posts da Meta eliminando rastros de download para repostar no TikTok.
            </p>
          </div>
        </button>

        {/* Card 2: Área TikTok */}
        <button
          type="button"
          id="select-tiktok-area-btn"
          className={`platform-tab-card ${platformArea === 'tiktok' ? 'active-tiktok' : ''}`}
          onClick={() => {
            setPlatformArea('tiktok');
            setErrorMessage('');
            setRequiresFallback(false);
          }}
        >
          <div className="platform-card-top">
            <div className="platform-card-icon icon-tiktok-bg">
              <TikTokIcon size={22} />
            </div>
            <span className="platform-card-badge badge-tiktok">Sem Marca d’Água</span>
          </div>
          <div>
            <div className="platform-card-title">
              <span>Área TikTok</span>
              {platformArea === 'tiktok' && <span className="active-indicator-dot dot-tiktok" />}
            </div>
            <p className="platform-card-desc">
              Baixe vídeos do TikTok em HD sem marca d’água e sem IDs da ByteDance para repostar no Reels.
            </p>
          </div>
        </button>

        {/* Card 3: Área Arquivo / Link Direto */}
        <button
          type="button"
          id="select-file-area-btn"
          className={`platform-tab-card ${platformArea === 'file' ? 'active-file' : ''}`}
          onClick={() => {
            setPlatformArea('file');
            setErrorMessage('');
            setRequiresFallback(false);
          }}
        >
          <div className="platform-card-top">
            <div className="platform-card-icon icon-file-bg">
              <Upload size={22} />
            </div>
            <span className="platform-card-badge badge-file">Upload / Link</span>
          </div>
          <div>
            <div className="platform-card-title">
              <span>Arquivo Local</span>
              {platformArea === 'file' && <span className="active-indicator-dot dot-file" />}
            </div>
            <p className="platform-card-desc">
              Envie arquivos MP4/MOV do seu computador ou celular para limpar metadados offline.
            </p>
          </div>
        </button>
      </section>

      {/* Main Glass Card Area */}
      <section className="glass-card" aria-label="Área de processamento de vídeo">
        {step !== 'ready' && (
          <>
            {/* Context Notification Banner */}
            {platformArea === 'instagram' && (
              <div className="area-banner area-banner-insta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <InstagramIcon size={18} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Você está na <strong>Área de Download do Instagram</strong>. Cole o link de qualquer Reel ou Post.
                  </span>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    background: 'rgba(0, 242, 254, 0.12)',
                    color: '#7dd3fc',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    borderRadius: 'var(--radius-full)',
                  }}
                  onClick={() => setPlatformArea('tiktok')}
                >
                  <TikTokIcon size={14} />
                  <span>Ir para Área TikTok</span>
                </button>
              </div>
            )}

            {platformArea === 'tiktok' && (
              <div className="area-banner area-banner-tiktok">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <TikTokIcon size={18} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Você está na <strong>Área de Download do TikTok</strong>. Baixe sem marca d’água em alta definição.
                  </span>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    background: 'rgba(225, 48, 108, 0.15)',
                    color: '#fda4af',
                    border: '1px solid rgba(225, 48, 108, 0.3)',
                    borderRadius: 'var(--radius-full)',
                  }}
                  onClick={() => setPlatformArea('instagram')}
                >
                  <InstagramIcon size={14} />
                  <span>Ir para Área Instagram</span>
                </button>
              </div>
            )}

            {/* AREA 1: INSTAGRAM */}
            {platformArea === 'instagram' && (
              <form onSubmit={handleInstagramSubmit} className="input-group">
                <div className="url-input-wrapper url-input-wrapper-insta">
                  <div style={{ color: '#f43f5e', display: 'flex', alignItems: 'center' }}>
                    <InstagramIcon size={20} />
                  </div>
                  <input
                    id="instagram-url-input"
                    type="url"
                    placeholder="Cole aqui o link do Reel ou Post (ex: https://www.instagram.com/reel/...)"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="url-input"
                    required
                    disabled={step !== 'idle' && step !== 'error'}
                  />
                  <button
                    type="button"
                    id="paste-instagram-btn"
                    onClick={() => handlePaste('instagram')}
                    className="paste-btn"
                    title="Colar da área de transferência"
                  >
                    {copiedField === 'instagram' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    <span>{copiedField === 'instagram' ? 'Colado!' : 'Colar'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  id="process-instagram-btn"
                  className="action-btn-insta"
                  disabled={!instagramUrl.trim() || (step !== 'idle' && step !== 'error')}
                >
                  {step !== 'idle' && step !== 'error' ? (
                    <>
                      <div className="spinner" />
                      <span>{statusMessage || 'Processando vídeo do Instagram...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Baixar e Purificar do Instagram</span>
                    </>
                  )}
                </button>

                <div className="feature-pills-row">
                  <span className="feature-pill feature-pill-insta">📸 Reels & Vídeos da Meta</span>
                  <span className="feature-pill feature-pill-insta">⚡ Download Direto do CDN</span>
                  <span className="feature-pill feature-pill-insta">🛡️ Átomos udta e GPS Zerados</span>
                  <span className="feature-pill feature-pill-insta">🚀 Pronto para Repostar no TikTok</span>
                </div>
              </form>
            )}

            {/* AREA 2: TIKTOK */}
            {platformArea === 'tiktok' && (
              <form onSubmit={handleTikTokSubmit} className="input-group">
                <div className="url-input-wrapper url-input-wrapper-tiktok">
                  <div style={{ color: '#00f2fe', display: 'flex', alignItems: 'center' }}>
                    <TikTokIcon size={20} />
                  </div>
                  <input
                    id="tiktok-url-input"
                    type="url"
                    placeholder="Cole o link do TikTok (ex: https://www.tiktok.com/@user/video/... ou vm.tiktok.com/...)"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="url-input"
                    required
                    disabled={step !== 'idle' && step !== 'error'}
                  />
                  <button
                    type="button"
                    id="paste-tiktok-btn"
                    onClick={() => handlePaste('tiktok')}
                    className="paste-btn"
                    title="Colar da área de transferência"
                  >
                    {copiedField === 'tiktok' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    <span>{copiedField === 'tiktok' ? 'Colado!' : 'Colar'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="prefer-hd-checkbox"
                      checked={preferHd}
                      onChange={(e) => setPreferHd(e.target.checked)}
                      style={{ accentColor: '#00f2fe', width: '16px', height: '16px' }}
                    />
                    <span>Priorizar Qualidade Máxima (HD Sem Marca d’Água)</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#00f2fe',
                      fontWeight: 700,
                      background: 'rgba(0, 242, 254, 0.1)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    ✨ No Watermark
                  </span>
                </div>

                <button
                  type="submit"
                  id="process-tiktok-btn"
                  className="action-btn-tiktok"
                  disabled={!tiktokUrl.trim() || (step !== 'idle' && step !== 'error')}
                >
                  {step !== 'idle' && step !== 'error' ? (
                    <>
                      <div className="spinner" style={{ borderTopColor: '#000' }} />
                      <span style={{ color: '#080b11' }}>{statusMessage || 'Processando vídeo do TikTok...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Baixar Sem Marca d’Água e Purificar</span>
                    </>
                  )}
                </button>

                <div className="feature-pills-row">
                  <span className="feature-pill feature-pill-tiktok">🚫 100% Sem Marca d’Água</span>
                  <span className="feature-pill feature-pill-tiktok">📱 Suporta Links de Celular (vm.tiktok.com)</span>
                  <span className="feature-pill feature-pill-tiktok">🛡️ Remove IDs e Tags ByteDance</span>
                  <span className="feature-pill feature-pill-tiktok">🚀 Pronto para Repostar no Instagram Reels</span>
                </div>
              </form>
            )}

            {/* AREA 3: ARQUIVO / LINK DIRETO */}
            {platformArea === 'file' && (
              <div>
                {/* Sub tabs for file mode */}
                <div className="tabs-container" style={{ marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    className={`tab-btn ${fileSubTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setFileSubTab('upload')}
                  >
                    <Upload size={16} />
                    <span>Upload de Vídeo Local (.mp4 / .mov)</span>
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${fileSubTab === 'direct' ? 'active' : ''}`}
                    onClick={() => setFileSubTab('direct')}
                  >
                    <FileVideo size={16} />
                    <span>Link Direto de Vídeo (.mp4)</span>
                  </button>
                </div>

                {fileSubTab === 'upload' && (
                  <div
                    className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragActive(true);
                    }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragActive(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      id="video-file-input"
                      ref={fileInputRef}
                      accept="video/mp4,video/quicktime,video/x-m4v"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <div className="dropzone-icon-circle icon-file-bg">
                      <Upload size={30} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Arraste o vídeo aqui ou clique para selecionar
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Suporta arquivos MP4, MOV e M4V de qualquer rede social ou gravados na câmera.
                      </p>
                    </div>
                  </div>
                )}

                {fileSubTab === 'direct' && (
                  <form onSubmit={handleDirectUrlSubmit} className="input-group">
                    <div className="url-input-wrapper">
                      <FileVideo size={20} color="#06b6d4" />
                      <input
                        id="direct-url-input"
                        type="url"
                        placeholder="Insira o link direto de um vídeo MP4 (ex: https://...video.mp4)"
                        value={directVideoUrl}
                        onChange={(e) => setDirectVideoUrl(e.target.value)}
                        className="url-input"
                        required
                        disabled={step !== 'idle' && step !== 'error'}
                      />
                      <button
                        type="button"
                        id="paste-direct-btn"
                        onClick={() => handlePaste('direct')}
                        className="paste-btn"
                      >
                        {copiedField === 'direct' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        <span>{copiedField === 'direct' ? 'Colado!' : 'Colar'}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      id="process-direct-btn"
                      className="action-btn-primary"
                      disabled={!directVideoUrl.trim() || (step !== 'idle' && step !== 'error')}
                    >
                      <Sparkles size={20} />
                      <span>Limpar Metadados do Vídeo</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Fallback Notice */}
            {requiresFallback && (
              <div className="alert-box alert-warning" style={{ marginTop: '1.25rem' }}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Aviso:</strong> {fallbackHelp}
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      className="tab-btn active"
                      style={{ display: 'inline-flex', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        setPlatformArea('file');
                        setFileSubTab('upload');
                        setRequiresFallback(false);
                      }}
                    >
                      <Upload size={14} />
                      <span>Ir para Upload de Arquivo Local</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="alert-box alert-error" style={{ marginTop: '1.25rem' }}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Erro:</strong> {errorMessage}
                </div>
              </div>
            )}

            {/* Active Pipeline Visualizer when processing */}
            {step !== 'idle' && step !== 'error' && (
              <div className="pipeline-box">
                <div className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  <span>{statusMessage}</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width:
                        step === 'fetching' ? '35%' : step === 'inspecting' ? '70%' : step === 'stripping' ? '90%' : '100%',
                    }}
                  />
                </div>
                <div className="pipeline-steps">
                  <div className={`step-card ${step === 'fetching' ? 'active' : 'done'}`}>
                    <span className="step-header">Passo 1</span>
                    <span className="step-title">
                      {platformArea === 'tiktok' ? 'Download TikTok' : 'Download Instagram'}
                    </span>
                  </div>
                  <div
                    className={`step-card ${
                      step === 'inspecting' ? 'active' : step === 'stripping' ? 'done' : ''
                    }`}
                  >
                    <span className="step-header">Passo 2</span>
                    <span className="step-title">Inspeção Binária</span>
                  </div>
                  <div className={`step-card ${step === 'stripping' ? 'active' : ''}`}>
                    <span className="step-header">Passo 3</span>
                    <span className="step-title">Purificação RAW</span>
                  </div>
                  <div className="step-card">
                    <span className="step-header">Passo 4</span>
                    <span className="step-title">Vídeo Limpo</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* READY STATE: VIDEO PREVIEW, METADATA AUDIT & DOWNLOAD BUTTONS */}
        {step === 'ready' && cleanResult && cleanVideoUrl && (
          <div className="preview-container">
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={16} />
                <span>Metadados Removidos em {cleanResult.processingTimeMs} ms</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Seu Vídeo Está 100% Limpo!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {sourcePlatform === 'tiktok'
                  ? 'Vídeo sem marca d’água do TikTok. Rastros de autor, identificadores e coordenadas foram expurgados.'
                  : 'Todos os átomos de identificação da Meta, carimbos de data/hora e assinaturas foram expurgados.'}
              </p>
            </div>

            {/* Video Player Preview */}
            <div className="video-wrapper">
              <span className="video-clean-tag">
                <ShieldCheck size={14} />
                RAW BITSTREAM • {sourcePlatform === 'tiktok' ? 'TIKTOK CLEAN' : 'INSTAGRAM CLEAN'}
              </span>
              <video
                src={cleanVideoUrl}
                controls
                playsInline
                preload="metadata"
                id="clean-video-player"
              />
            </div>

            {/* Metadata Comparison Audit (Antes vs Depois) */}
            <div className="metadata-grid">
              {/* Before Panel */}
              <div className="meta-panel">
                <div className="meta-panel-header">
                  <span className="meta-panel-title">
                    <Layers size={18} color="#f87171" />
                    <span>Metadados Anteriores</span>
                  </span>
                  {sourcePlatform === 'tiktok' ? (
                    <span className="tag-tiktok">🚨 Rastros do TikTok</span>
                  ) : (
                    <span className="tag-instagram">🚨 Rastros do Instagram</span>
                  )}
                </div>
                <div className="meta-list">
                  <div className="meta-item">
                    <span className="meta-key">📸 Origem da Mídia:</span>
                    <span className="meta-val-dirty">
                      {sourcePlatform === 'tiktok'
                        ? 'TikTok Vídeo (ByteDance CDN)'
                        : 'Instagram Reel / Post (Meta CDN)'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">📦 Átomo udta:</span>
                    <span className="meta-val-dirty">
                      {sourcePlatform === 'tiktok'
                        ? 'Ativo (IDs do TikTok Video)'
                        : 'Ativo (IDs do Reel da Meta)'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">
                      <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Carimbo do Servidor:
                    </span>
                    <span className="meta-val-dirty">
                      {cleanResult.detectedMetadata.creationDate
                        ? new Date(cleanResult.detectedMetadata.creationDate).toLocaleDateString('pt-BR')
                        : 'Data de Publicação Gravada'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">
                      <Cpu size={14} style={{ display: 'inline', marginRight: '4px' }} /> Assinatura / Encoder:
                    </span>
                    <span className="meta-val-dirty">
                      {cleanResult.detectedMetadata.encoder ||
                        (sourcePlatform === 'tiktok' ? 'ByteDance Pipeline' : 'Meta Media Pipeline')}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Localização / Região:
                    </span>
                    <span className="meta-val-dirty">
                      {cleanResult.detectedMetadata.location || 'Tags de Servidor / Região'}
                    </span>
                  </div>
                </div>

                <div className="tags-cloud">
                  {sourcePlatform === 'tiktok' ? (
                    <>
                      <span className="tag-pill-dirty">🚨 Marca d’Água Original</span>
                      <span className="tag-pill-dirty">🏷️ Átomo udta (ID TikTok)</span>
                      <span className="tag-pill-dirty">🌐 tiktokcdn.com</span>
                      <span className="tag-pill-dirty">🕒 Carimbo ByteDance</span>
                    </>
                  ) : (
                    <>
                      <span className="tag-pill-dirty">🚨 Tag de Origem Meta</span>
                      <span className="tag-pill-dirty">🏷️ Átomo udta (ID Instagram)</span>
                      <span className="tag-pill-dirty">🌐 cdninstagram.com</span>
                      <span className="tag-pill-dirty">🕒 Carimbo de Servidor Meta</span>
                    </>
                  )}
                </div>
              </div>

              {/* After Panel */}
              <div className="meta-panel">
                <div className="meta-panel-header">
                  <span className="meta-panel-title">
                    <ShieldCheck size={18} color="#34d399" />
                    <span>
                      {sourcePlatform === 'tiktok'
                        ? 'Status Atual (Pronto pro Reels)'
                        : 'Status Atual (Pronto pro TikTok)'}
                    </span>
                  </span>
                  <span className="meta-badge-success">100% RAW Puro</span>
                </div>
                <div className="meta-list">
                  <div className="meta-item">
                    <span className="meta-key">🛡️ Rastro da Plataforma:</span>
                    <span className="meta-val-clean">0 bytes (Totalmente Erradicado)</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">📦 Átomo de Dados (`udta`):</span>
                    <span className="meta-val-clean">Zerado (Substituído por free 0x00)</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">
                      <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Carimbo de Servidor:
                    </span>
                    <span className="meta-val-clean">00:00:00 (Universal Epoch Zerado)</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Hash Anti-Duplicidade:</span>
                    <span className="meta-val-clean">#{cleanResult.uniqueFileHash} (Salt Único Inédito)</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Nome Simulado:</span>
                    <span className="meta-val-clean">{cleanResult.recommendedFilename}</span>
                  </div>
                </div>

                <div className="tags-cloud">
                  {sourcePlatform === 'tiktok' ? (
                    <>
                      <span className="tag-pill-clean">✅ Zero Watermark TikTok</span>
                      <span className="tag-pill-clean">✅ udta Zerado</span>
                      <span className="tag-pill-clean">✅ Hash Único Ativo</span>
                      <span className="tag-pill-clean">📱 Simulação Câmera iPhone</span>
                      <span className="tag-pill-clean">🚀 Alcance no Reels Protegido</span>
                    </>
                  ) : (
                    <>
                      <span className="tag-pill-clean">✅ Zero Rastros do Insta</span>
                      <span className="tag-pill-clean">✅ udta Zerado</span>
                      <span className="tag-pill-clean">✅ Hash Único Ativo</span>
                      <span className="tag-pill-clean">📱 Simulação Câmera iPhone</span>
                      <span className="tag-pill-clean">🚀 Alcance no TikTok Protegido</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Camera Style Filename Selector */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignItems: 'center',
                margin: '0.5rem 0',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Formato do nome para simular gravação na câmera do celular (evita flag de repost):
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className={`tab-btn ${cameraStyle === 'iphone' ? 'active' : ''}`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setCameraStyle('iphone');
                    if (cleanResult) {
                      cleanResult.recommendedFilename = `IMG_${Math.floor(1000 + Math.random() * 9000)}.mp4`;
                      setCleanResult({ ...cleanResult });
                    }
                  }}
                >
                  📱 Estilo iPhone (IMG_XXXX.mp4)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${cameraStyle === 'android' ? 'active' : ''}`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setCameraStyle('android');
                    if (cleanResult) {
                      const now = new Date();
                      const y = now.getFullYear();
                      const m = String(now.getMonth() + 1).padStart(2, '0');
                      const d = String(now.getDate()).padStart(2, '0');
                      cleanResult.recommendedFilename = `VID_${y}${m}${d}_${Math.floor(
                        100000 + Math.random() * 900000
                      )}.mp4`;
                      setCleanResult({ ...cleanResult });
                    }
                  }}
                >
                  🤖 Estilo Android (VID_YYYYMMDD.mp4)
                </button>
              </div>
            </div>

            {/* Action Buttons Group */}
            <div className="action-buttons-group">
              {canShare && (
                <button
                  type="button"
                  id="share-clean-video-btn"
                  onClick={handleShare}
                  className="action-btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    boxShadow: '0 8px 25px rgba(6, 182, 212, 0.35)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '1.15rem 1.75rem',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                  }}
                >
                  <Share2 size={22} />
                  <span>Salvar nas Fotos (iPhone) / Compartilhar</span>
                </button>
              )}

              <a
                id="download-clean-video-btn"
                href={cleanVideoUrl}
                download={cleanResult.recommendedFilename}
                onClick={handleDownloadClick}
                className="download-clean-btn"
              >
                <Download size={22} />
                <span>Baixar Arquivo Limpo ({cleanResult.recommendedFilename})</span>
              </a>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="clean-another-insta-btn"
                  onClick={() => handleReset('instagram')}
                  className="secondary-reset-btn"
                  style={{ flex: 1 }}
                >
                  <InstagramIcon size={16} />
                  <span>Baixar Outro do Instagram</span>
                </button>

                <button
                  type="button"
                  id="clean-another-tiktok-btn"
                  onClick={() => handleReset('tiktok')}
                  className="secondary-reset-btn"
                  style={{ flex: 1 }}
                >
                  <TikTokIcon size={16} />
                  <span>Baixar do TikTok</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Cross-Platform Comparison & Features Grid */}
      <section className="features-grid" aria-label="Benefícios da remoção de metadados">
        <div className="feature-box">
          <div className="feature-icon-wrapper" style={{ background: 'rgba(225, 48, 108, 0.15)', color: '#f43f5e' }}>
            <InstagramIcon size={22} />
          </div>
          <h2 className="feature-title">Do Instagram para o TikTok</h2>
          <p className="feature-desc">
            Algoritmos do TikTok penalizam com shadowban vídeos com metadados do Instagram. Nossa purificação remove
            átomos `udta` da Meta, GPS e carimbos, além de injetar um salt único que impede detecção de duplicata.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-wrapper" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
            <TikTokIcon size={22} />
          </div>
          <h2 className="feature-title">Do TikTok para o Reels</h2>
          <p className="feature-desc">
            O Instagram Reels rejeita e derruba o alcance de vídeos que contêm a marca d’água do TikTok. Baixamos o
            fluxo original limpo sem marca d’água (HD No Watermark) e eliminamos IDs da ByteDance.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-wrapper">
            <Zap size={22} />
          </div>
          <h2 className="feature-title">Zero Perda de Qualidade</h2>
          <p className="feature-desc">
            A limpeza é binária e cirúrgica (Stream Copy sem recompressão). Os quadros de imagem e faixas de áudio
            permanecem com 100% da fidelidade original, processados em nanossegundos no seu próprio navegador.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>PureClip • Ferramenta profissional para criadores de conteúdo, editores de vídeo e agências.</p>
        <p style={{ opacity: 0.7 }}>
          Áreas dedicadas para download e purificação do Instagram e TikTok. Processamento binário seguro no navegador.
        </p>
      </footer>
    </main>
  );
}
