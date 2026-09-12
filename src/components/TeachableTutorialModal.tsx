import React, { useState } from 'react';
import { X, ExternalLink, ChevronRight, CheckCircle2, Copy, Sparkles, Camera, Cpu, UploadCloud } from 'lucide-react';

interface TeachableTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeachableTutorialModal: React.FC<TeachableTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Buka Google Teachable Machine',
      icon: ExternalLink,
      desc: 'Kunjungi situs resmi Teachable Machine by Google di browser kamu. Klik "Get Started", lalu pilih "Image Project" dan pilih "Standard image model" (model gambar standar).',
      actionLink: 'https://teachablemachine.withgoogle.com/train/image',
      actionText: 'Buka Teachable Machine Train',
    },
    {
      id: 2,
      title: 'Buat 4 Kelas Label',
      icon: Camera,
      desc: 'Ubah nama Class 1 dan Class 2, serta tambahkan 2 kelas baru (Add a class) sehingga kamu memiliki 4 kelas berikut:',
      classes: [
        { name: 'Batu', emoji: '✊', desc: 'Kepalkan tangan membentuk tinju batu' },
        { name: 'Gunting', emoji: '✌️', desc: 'Dua jari telunjuk & tengah membentuk gunting' },
        { name: 'Kertas', emoji: '✋', desc: 'Buka seluruh telapak tangan membentuk kertas' },
        { name: 'Netral', emoji: '🚫', desc: 'Tangan kosong, latar belakang, atau posisi diam' },
      ],
    },
    {
      id: 3,
      title: 'Ambil Sampel Gambar Webcam (50 - 100 per kelas)',
      icon: Sparkles,
      desc: 'Klik tombol "Webcam" pada masing-masing kelas. Tahan tombol "Hold to Record" sambil menggerakkan sedikit posisi tangan (sedikit miringkan, dekatkan, jauhkan) untuk membuat model lebih pintar dan tahan terhadap berbagai kondisi cahaya!',
    },
    {
      id: 4,
      title: 'Latih Model (Train Model)',
      icon: Cpu,
      desc: 'Klik tombol "Train Model" dan tunggu beberapa saat hingga proses pelatihan selesai (biasanya 15-45 detik). Jangan tutup tab browser selama proses pelatihan.',
    },
    {
      id: 5,
      title: 'Export Model & Dapatkan Link TensorFlow.js',
      icon: UploadCloud,
      desc: 'Di panel Preview sebelah kanan, klik tombol "Export Model". Pilih tab "Tensorflow.js", lalu klik "Upload (shareable link)". Setelah upload selesai, salin URL model (contoh: https://teachablemachine.withgoogle.com/models/I517u8V2z/) dan tempelkan ke Pengaturan Model di game ini!',
    },
  ];

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Panduan Melatih Model Teachable Machine
            </h2>
            <p className="text-xs text-slate-400">
              Langkah mudah membuat AI pendeteksi Batu Gunting Kertas sendiri
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <span>{step.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

                    {/* Classes details for Step 2 */}
                    {step.classes && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {step.classes.map((cls) => (
                          <div
                            key={cls.name}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center"
                          >
                            <div className="text-2xl mb-1">{cls.emoji}</div>
                            <div className="text-xs font-bold text-white">{cls.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                              {cls.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action link */}
                    {step.actionLink && (
                      <div className="mt-3">
                        <a
                          href={step.actionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm cursor-pointer"
                        >
                          <span>{step.actionText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Sudah punya link model? Masukkan di tombol <b>Model AI</b> di atas!
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
