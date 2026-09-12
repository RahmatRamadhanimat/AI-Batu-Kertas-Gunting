import React, { useState } from 'react';
import { X, Github, Copy, Check, Terminal, FileCode, CheckCircle2, Globe } from 'lucide-react';

interface GithubDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubDeployGuideModal: React.FC<GithubDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const workflowYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const ghPagesCommands = `# 1. Install dependencies
npm install

# 2. Build aplikasi (hasil ada di folder dist)
npm run build

# 3. Deploy langsung folder dist ke branch gh-pages
npx gh-pages -d dist`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center shadow-lg">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Panduan Deploy ke GitHub Pages
            </h2>
            <p className="text-xs text-slate-400">
              Aplikasi ini sudah dikonfigurasi dengan path relatif (<code className="text-amber-400 font-mono">base: './'</code>) sehingga siap live di GitHub Pages!
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-3">
          <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white mb-0.5">Siap Hosting di Domain Gratis GitHub!</div>
            Karena ini aplikasi SPA berbasis Client-Side (TensorFlow.js berjalan langsung di browser pengguna), game ini 100% gratis dan bisa diakses publik melalui URL:
            <div className="font-mono text-amber-300 mt-1">https://username.github.io/nama-repo/</div>
          </div>
        </div>

        {/* Method 1: GitHub Actions (Recommended) */}
        <div className="space-y-5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Metode 1: Otomatis via GitHub Actions (Rekomendasi)
                </h3>
              </div>
              <button
                onClick={() => copyCode(workflowYaml, 'yaml')}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                {copiedIndex === 'yaml' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin YAML</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Buat file baru di repositori GitHub kamu pada path:
              <code className="text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded mx-1">
                .github/workflows/deploy.yml
              </code>
              lalu tempelkan konfigurasi berikut:
            </p>
            <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {workflowYaml}
            </pre>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Di repositori GitHub, buka <b>Settings &gt; Pages &gt; Source</b> dan pilih <b>GitHub Actions</b>.
              </span>
            </div>
          </div>

          {/* Method 2: gh-pages command */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Metode 2: Deploy Cepat via Terminal (gh-pages)
                </h3>
              </div>
              <button
                onClick={() => copyCode(ghPagesCommands, 'cli')}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                {copiedIndex === 'cli' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Perintah</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Jalankan perintah ini di komputer / terminal lokal kamu:
            </p>
            <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto leading-relaxed">
              {ghPagesCommands}
            </pre>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Pada <b>Settings &gt; Pages &gt; Branch</b>, pilih branch <b>gh-pages</b> dan folder <b>/(root)</b>.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
