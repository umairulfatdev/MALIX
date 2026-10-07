"use client";

import { useState } from "react";
import { Download, Check, ChevronDown } from "lucide-react";
import { recordDownload, type DownloadOption } from "@/server/actions/downloads";
import { toast } from "sonner";

interface DownloadButtonProps {
  contentId: string;
  options: DownloadOption[];
  compact?: boolean;
}

export function DownloadButton({
  contentId,
  options,
  compact = false,
}: DownloadButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  if (options.length === 0) return null;

  async function handleDownload(option: DownloadOption) {
    setDownloading(option.id);

    try {
      const result = await recordDownload(contentId, option.quality, option.id);

      if (!result.success) {
        toast.error(result.error || "Download failed");
        setDownloading(null);
        return;
      }

      // Trigger browser download
      const link = document.createElement("a");
      link.href = option.fileUrl;
      link.download = `${option.quality}.${option.format || "mp4"}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded((prev) => new Set(prev).add(option.id));
      toast.success(`Download started: ${option.quality}`);
    } catch {
      toast.error("Failed to start download");
    } finally {
      setDownloading(null);
    }
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-medium"
        >
          <Download size={14} />
          Download
          <ChevronDown size={12} />
        </button>

        {showMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-cosmic rounded-xl py-2 shadow-2xl z-30 animate-fade-in">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  handleDownload(opt);
                  setShowMenu(false);
                }}
                disabled={downloading === opt.id}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-white hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {downloaded.has(opt.id) ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Download size={12} className="text-yellow-500" />
                  )}
                  <span className="font-semibold">{opt.quality}</span>
                </div>
                {opt.fileSize && (
                  <span className="text-zinc-400">{opt.fileSize}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-cosmic-ghost flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold"
      >
        <Download size={18} />
        Download
        <ChevronDown size={14} />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowMenu(false)}
          />

          <div className="absolute top-full left-0 mt-3 glass-cosmic rounded-xl py-2 shadow-2xl z-30 min-w-[280px] animate-fade-in">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Choose Quality
              </p>
            </div>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDownload(opt)}
                disabled={downloading === opt.id}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-white hover:bg-yellow-500/10 transition-colors disabled:opacity-50 group"
              >
                <div className="flex items-center gap-3">
                  {downloaded.has(opt.id) ? (
                    <Check size={16} className="text-green-500" />
                  ) : downloading === opt.id ? (
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download
                      size={16}
                      className="text-yellow-500 group-hover:scale-110 transition-transform"
                    />
                  )}
                  <div>
                    <div className="font-bold">{opt.quality}</div>
                    <div className="text-xs text-zinc-500 uppercase">
                      {opt.format || "MP4"}
                    </div>
                  </div>
                </div>
                {opt.fileSize && (
                  <span className="text-xs text-zinc-400 font-mono">
                    {opt.fileSize}
                  </span>
                )}
              </button>
            ))}
            <div className="px-4 py-2 border-t border-white/10 mt-1">
              <p className="text-[10px] text-zinc-500">
                Authorized content only. Downloads permitted by rights holder.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}