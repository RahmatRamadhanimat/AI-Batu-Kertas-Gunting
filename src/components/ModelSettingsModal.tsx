import React, { useState } from 'react';
import { X, Check, AlertCircle, RefreshCw, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { ModelMetadata } from '../types';
import { DEFAULT_MODEL_URL } from '../utils/teachableMachine';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelMeta: ModelMetadata;
  onLoadModel: (url: string) => Promise<void>;
  isSimulated: boolean;
  onToggleSimulated: () => void;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  modelMeta,
  onLoadModel,
  isSimulated,
  onToggleSimulated,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(modelMeta.url || DEFAULT_MODEL_URL);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await onLoadModel(inputUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat model.');
    }
  };

  const handleUseDefault = async () => {
    setInputUrl(DEFAULT_MODEL_URL);
    setErrorMessage(null);
    try {
      await onLoadModel(DEFAULT_MODEL_URL);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat default model.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pengaturan Model Teachable Machine</h2>
            <p className="text-xs text-slate-400">
              Gunakan model AI buatanmu sendiri atau model bawaan
            </p>
          </div>
        </div>

        {/* Form input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              URL Model Teachable Machine:
            </label>
            <div className="relative">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://teachablemachine.withgoogle.com/models/I517u8V2z/"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Format URL yang dihasilkan setelah menekan tombol <b>Export Model &gt; Upload my model</b> di Google Teachable Machine.
            </p>
          </div>

          {/* Quick presets buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              Gunakan Model Standar
            </button>
            <a
              href="https://teachablemachine.withgoogle.com/train/image"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all flex items-center gap-1 ml-auto"
            >
              <span>Buka Teachable Machine</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Status Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {modelMeta.isLoaded && !errorMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Model AI Berhasil Terhubung!</div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">
                  Label terdeteksi ({modelMeta.labels.length}):{' '}
                  <span className="font-mono">{modelMeta.labels.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={modelMeta.isLoading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {modelMeta.isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <span>Terapkan Model</span>
              )}
            </button>
          </div>
        </form>

        {/* Labels requirement info card */}
        <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Rekomendasi Label Kelas di Teachable Machine:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li><b>Batu</b> (atau Rock / Tinju)</li>
            <li><b>Gunting</b> (atau Scissors / Peace)</li>
            <li><b>Kertas</b> (atau Paper / Telapak)</li>
            <li><b>Netral</b> (atau Background / Kosong)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
