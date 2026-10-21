# PureClip 🚀 — Baixar Vídeos do Instagram & TikTok Sem Marca d'Água (100% RAW)

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Aplicativo web de alta performance desenvolvido para criadores de conteúdo, editores de vídeo e estrategistas digitais. Possui áreas dedicadas para:
- **📸 Instagram:** Download de Reels e Posts com eliminação de rastros da Meta.
- **🎵 TikTok:** Download em Alta Resolução (HD) **Sem Marca d'Água** (*No Watermark*) e sem IDs da ByteDance.
- **📁 Arquivo Local:** Purificação binária instantânea de qualquer arquivo `.mp4` ou `.mov`.

O motor **remove cirurgicamente todos os metadados, EXIF, geolocalização e identificadores de plataforma**, entregando um arquivo MP4 100% cru (RAW bitstream) pronto para repostar sem penalizações algorítmicas de alcance.

---

## ⚡ Por que remover os metadados e marca d'água antes de repostar?

Plataformas como **TikTok, Instagram Reels e YouTube Shorts** analisam os átomos binários dos arquivos MP4 (`udta`, `mvhd`, assinaturas de encoder como `Lavf` e carimbos de data). Quando você reposta um vídeo baixado diretamente:

1. **O algoritmo detecta a origem de download** e penaliza a distribuição orgânica (conteúdo reciclado/duplicado ou flag de repost).
2. **Marcas d'água do TikTok** fazem o algoritmo do Instagram Reels rebaixar o vídeo no explorar.
3. **Carimbos de data e hora antigos** revelam que a mídia não é recente.
4. **Coordenadas de GPS e dados do aparelho** podem vazar sua privacidade ou localização original.

Com o **PureClip**, todos esses átomos são desintegrados diretamente no cliente em milissegundos, com **ZERO perda de qualidade de imagem ou som** (Stream Copy binário).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Linguagem:** TypeScript
- **Estilização:** Vanilla CSS Moderno (Glassmorphism, Dark Mode, Glows adaptativos, responsivo)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Processamento de Átomos:** Parser binário ISO-BMFF / MP4 sob medida em TypeScript
- **Deploy:** 100% compatível com Vercel (Serverless Edge & Node.js Runtime)

---

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/PureClip.git
   cd PureClip
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Acesse em seu navegador: `http://localhost:3000`

---

## ☁️ Como Fazer Deploy no Vercel

1. Suba este projeto para o seu GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: PureClip Instagram & TikTok Downloader & Metadata Stripper"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/PureClip.git
   git push -u origin main
   ```

2. Acesse [vercel.com/new](https://vercel.com/new).
3. Selecione o repositório que você acabou de criar.
4. Clique em **Deploy** (o Next.js será reconhecido automaticamente com zero configuração adicional).
5. Pronto! Seu site estará no ar com HTTPS gratuito e CDN global!

---

## 📂 Estrutura do Projeto

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── instagram/route.ts  # Resolver multi-estratégia do Instagram
│   │   │   ├── tiktok/route.ts     # Extrator TikTok Sem Marca d'Água (HD)
│   │   │   └── proxy/route.ts      # Streaming de vídeo com bypass de CORS
│   │   ├── globals.css             # Design System Vanilla CSS Glassmorphism
│   │   ├── layout.tsx              # SEO, fontes e estrutura base
│   │   └── page.tsx                # Interface reativa com áreas Instagram & TikTok
│   └── lib/
│       └── mp4Cleaner.ts           # Motor binário de higienização de MP4/EXIF
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## 🔒 Privacidade

O processamento e remoção dos metadados acontece localmente na memória do navegador do usuário (`ArrayBuffer`), garantindo que nenhum vídeo limpo seja armazenado permanentemente no servidor.

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
