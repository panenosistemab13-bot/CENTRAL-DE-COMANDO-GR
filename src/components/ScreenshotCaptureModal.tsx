import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Download, 
  Layers, 
  Check, 
  Loader2, 
  X, 
  Image as ImageIcon, 
  Sparkles,
  Play,
  Copy,
  AlertCircle
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { cn } from '../lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface ScreenshotCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  tabs: TabItem[];
  setActiveTab: (tabId: any) => void;
  isSlidesTheme?: boolean;
}

export function ScreenshotCaptureModal({
  isOpen,
  onClose,
  activeTab,
  tabs,
  setActiveTab,
  isSlidesTheme = false
}: ScreenshotCaptureModalProps) {
  const [isCapturingCurrent, setIsCapturingCurrent] = useState(false);
  const [isBatchCapturing, setIsBatchCapturing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; pageName: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [lastPreviewUrl, setLastPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStatusMessage(null);
    }
  }, [isOpen]);

  const sanitizeFileName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/__+/g, '_');
  };

  const getTargetElement = (): HTMLElement => {
    return (document.getElementById('app-capture-root') || document.getElementById('root') || document.body) as HTMLElement;
  };

  const captureElementToPng = async (element: HTMLElement, pixelRatio = 2): Promise<string> => {
    const filter = (node: HTMLElement) => {
      if (!node) return true;
      if (node.dataset && node.dataset.noScreenshot === 'true') return false;
      if (node.classList && node.classList.contains('no-screenshot')) return false;
      return true;
    };

    try {
      return await toPng(element, {
        cacheBust: true,
        pixelRatio,
        quality: 0.95,
        filter: filter as any,
      });
    } catch (err) {
      console.warn('Screenshot capture fallback with pixelRatio=1:', err);
      return await toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        skipFonts: true,
        quality: 0.9,
        filter: filter as any,
      });
    }
  };

  const triggerDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Capturar página atual
  const handleCaptureCurrentPage = async () => {
    try {
      setIsCapturingCurrent(true);
      setStatusMessage({ type: 'info', text: 'Gerando captura de alta resolução...' });

      // Breve pausa para fechar menus ou estabilizar render
      await new Promise(r => setTimeout(r, 150));

      const target = getTargetElement();
      const currentTabObj = tabs.find(t => t.id === activeTab);
      const pageTitle = currentTabObj?.label || activeTab;

      const dataUrl = await captureElementToPng(target, 2);
      setLastPreviewUrl(dataUrl);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `PGR_${sanitizeFileName(pageTitle)}_${timestamp}.png`;

      triggerDownload(dataUrl, fileName);

      setStatusMessage({ 
        type: 'success', 
        text: `Print da página "${pageTitle}" salvo com sucesso como ${fileName}!` 
      });
    } catch (error) {
      console.error('Erro ao capturar print:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Não foi possível capturar a imagem. Verifique os elementos da tela e tente novamente.' 
      });
    } finally {
      setIsCapturingCurrent(false);
    }
  };

  // Copiar print da página atual para a área de transferência
  const handleCopyCurrentPageToClipboard = async () => {
    try {
      setIsCapturingCurrent(true);
      setStatusMessage({ type: 'info', text: 'Copiando print para a área de transferência...' });

      await new Promise(r => setTimeout(r, 150));
      const target = getTargetElement();
      const filter = (node: HTMLElement) => {
        if (!node) return true;
        if (node.dataset && node.dataset.noScreenshot === 'true') return false;
        if (node.classList && node.classList.contains('no-screenshot')) return false;
        return true;
      };

      const blob = await toBlob(target, {
        cacheBust: true,
        pixelRatio: 1.5,
        filter: filter as any,
      });

      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setStatusMessage({ type: 'success', text: 'Imagem copiada para a área de transferência! (Cole com Ctrl+V)' });
      } else {
        throw new Error('ClipboardItem não suportado');
      }
    } catch (err) {
      console.error('Erro ao copiar print:', err);
      // Fallback: baixar o arquivo
      handleCaptureCurrentPage();
    } finally {
      setIsCapturingCurrent(false);
    }
  };

  // Capturar todas as páginas em lote (uma a uma com transição automática)
  const handleBatchCaptureAllPages = async () => {
    const originalTab = activeTab;
    setIsBatchCapturing(true);
    setStatusMessage({ type: 'info', text: 'Iniciando captura automática de todas as páginas...' });

    try {
      const targetTabs = tabs.length > 0 ? tabs : [{ id: activeTab, label: 'Atual' }];
      const total = targetTabs.length;

      for (let i = 0; i < total; i++) {
        const tab = targetTabs[i];
        setBatchProgress({ current: i + 1, total, pageName: tab.label });
        
        // Mudar para a aba alvo
        setActiveTab(tab.id);

        // Aguardar transição da página e animações assentarem
        await new Promise(r => setTimeout(r, 700));

        const target = getTargetElement();
        const dataUrl = await captureElementToPng(target, 1.8);

        const indexPrefix = String(i + 1).padStart(2, '0');
        const fileName = `${indexPrefix}_PGR_${sanitizeFileName(tab.label)}.png`;

        triggerDownload(dataUrl, fileName);

        // Intervalo entre downloads para o navegador não bloquear
        await new Promise(r => setTimeout(r, 450));
      }

      // Retornar para a aba original
      setActiveTab(originalTab);
      setBatchProgress(null);
      setStatusMessage({ 
        type: 'success', 
        text: `Parabéns! Todas as ${total} páginas foram capturadas e baixadas com sucesso!` 
      });
    } catch (err) {
      console.error('Erro na captura em lote:', err);
      setActiveTab(originalTab);
      setBatchProgress(null);
      setStatusMessage({ 
        type: 'error', 
        text: 'Ocorreu um erro durante a captura de algumas páginas.' 
      });
    } finally {
      setIsBatchCapturing(false);
    }
  };

  const currentTabObj = tabs.find(t => t.id === activeTab);
  const currentTabLabel = currentTabObj?.label || 'Página Atual';

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          data-no-screenshot="true"
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm no-screenshot"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden relative flex flex-col",
              isSlidesTheme
                ? "bg-[#020617] border-cyan-500/50 text-slate-100 shadow-[0_0_50px_rgba(0,240,255,0.25)]"
                : "bg-gradient-to-b from-[#2a170b] via-[#1f1006] to-[#120803] border-[#7d5635] text-[#eddabf] shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            )}
          >
            {/* Header */}
            <div className={cn(
              "px-6 py-4.5 flex items-center justify-between border-b relative",
              isSlidesTheme ? "border-cyan-500/30 bg-cyan-950/20" : "border-[#5c3e29] bg-[#1a0c04]/80"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border",
                  isSlidesTheme 
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]" 
                    : "bg-[#c02428] text-white border-[#ff6b6b]/40 shadow-[0_4px_12px_rgba(192,36,40,0.5)]"
                )}>
                  <Camera size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider font-sans leading-none flex items-center gap-2">
                    Captura de Tela (Print)
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-md font-mono font-bold tracking-widest uppercase border",
                      isSlidesTheme 
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500/40" 
                        : "bg-[#3d2415] text-[#fdefd1] border-[#7d5635]"
                    )}>
                      PNG HD
                    </span>
                  </h2>
                  <p className="text-[11px] opacity-75 mt-1">
                    Baixe prints em alta qualidade das telas do sistema
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isBatchCapturing}
                className={cn(
                  "p-2 rounded-xl border transition-all cursor-pointer",
                  isSlidesTheme
                    ? "hover:bg-cyan-500/20 text-cyan-400 border-transparent hover:border-cyan-500/40"
                    : "hover:bg-[#422513] text-[#dfc1a0] border-transparent hover:border-[#7d5635]"
                )}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Batch progress banner */}
              {isBatchCapturing && batchProgress && (
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col gap-2.5 animate-pulse",
                  isSlidesTheme
                    ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200"
                    : "bg-[#381c0c] border-[#b48257] text-[#ffe4c4]"
                )}>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-amber-400" />
                      Capturando ({batchProgress.current} de {batchProgress.total}):
                    </span>
                    <span className="font-mono text-amber-300">
                      {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="text-sm font-black font-sans uppercase text-white">
                    {batchProgress.pageName}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] opacity-80 text-center">
                    Aguarde, os prints estão sendo salvos no seu computador automaticamente...
                  </span>
                </div>
              )}

              {/* Status Message */}
              {statusMessage && !isBatchCapturing && (
                <div className={cn(
                  "p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 border",
                  statusMessage.type === 'success' && "bg-emerald-950/70 border-emerald-500/50 text-emerald-200",
                  statusMessage.type === 'error' && "bg-red-950/70 border-red-500/50 text-red-200",
                  statusMessage.type === 'info' && (isSlidesTheme ? "bg-cyan-950/70 border-cyan-500/50 text-cyan-200" : "bg-[#3d2415] border-[#7d5635] text-[#fdefd1]")
                )}>
                  {statusMessage.type === 'success' && <Check size={16} className="shrink-0 text-emerald-400" />}
                  {statusMessage.type === 'error' && <AlertCircle size={16} className="shrink-0 text-red-400" />}
                  {statusMessage.type === 'info' && <Loader2 size={16} className="shrink-0 animate-spin text-amber-400" />}
                  <span className="leading-snug">{statusMessage.text}</span>
                </div>
              )}

              {/* Primary Actions Grid */}
              <div className="grid grid-cols-1 gap-3.5">
                
                {/* 1. Print da Página Atual */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col gap-3",
                  isSlidesTheme
                    ? "bg-slate-900/60 border-cyan-500/30 hover:border-cyan-400/60"
                    : "bg-[#2b170c]/70 border-[#5c3e29] hover:border-[#8f6440]"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm",
                        isSlidesTheme ? "bg-cyan-500/20 text-cyan-300" : "bg-[#422513] text-amber-300"
                      )}>
                        <ImageIcon size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">
                          Página Atual: <span className="text-amber-300">{currentTabLabel}</span>
                        </h3>
                        <p className="text-[11px] opacity-75">
                          Tira um print exato do que está visível na tela agora.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleCaptureCurrentPage}
                      disabled={isCapturingCurrent || isBatchCapturing}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 border",
                        isSlidesTheme
                          ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                          : "bg-[#c02428] hover:bg-[#d62828] text-white border-[#ff6b6b]/40 shadow-[0_4px_12px_rgba(192,36,40,0.4)]"
                      )}
                    >
                      {isCapturingCurrent ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Capturando...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>Baixar Imagem (PNG)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyCurrentPageToClipboard}
                      disabled={isCapturingCurrent || isBatchCapturing}
                      className={cn(
                        "py-2.5 px-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border",
                        isSlidesTheme
                          ? "bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/30"
                          : "bg-[#381f10] hover:bg-[#4d2c18] text-[#fdefd1] border-[#6b472e]"
                      )}
                      title="Copiar imagem para colar no WhatsApp / E-mail (Ctrl+V)"
                    >
                      <Copy size={15} />
                      <span className="hidden sm:inline">Copiar</span>
                    </button>
                  </div>
                </div>

                {/* 2. Print de TODAS as Páginas em Lote */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col gap-3",
                  isSlidesTheme
                    ? "bg-slate-900/60 border-cyan-500/30 hover:border-cyan-400/60"
                    : "bg-[#2b170c]/70 border-[#5c3e29] hover:border-[#8f6440]"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm",
                        isSlidesTheme ? "bg-purple-500/20 text-purple-300" : "bg-[#422513] text-purple-300"
                      )}>
                        <Layers size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                          Capturar Todas as Páginas
                          <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-black">
                            {tabs.length} Telas
                          </span>
                        </h3>
                        <p className="text-[11px] opacity-75">
                          O sistema navega por cada tela automaticamente e baixa o print de cada uma em sequência.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBatchCaptureAllPages}
                    disabled={isCapturingCurrent || isBatchCapturing}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 border mt-1",
                      isSlidesTheme
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-purple-400/40"
                        : "bg-gradient-to-r from-[#9a3412] to-[#c02428] hover:from-[#c2410c] hover:to-[#d62828] text-white border-amber-500/40 shadow-[0_4px_15px_rgba(154,52,18,0.4)]"
                    )}
                  >
                    {isBatchCapturing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Capturando em Lote...</span>
                      </>
                    ) : (
                      <>
                        <Play size={15} className="fill-current" />
                        <span>Tirar Print de Cada Página e Salvar</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Tips & Guidance */}
              <div className="text-[10px] opacity-70 flex items-center justify-between px-1">
                <span>💡 Dica: Os arquivos PNG são salvos diretamente na sua pasta de Downloads.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
