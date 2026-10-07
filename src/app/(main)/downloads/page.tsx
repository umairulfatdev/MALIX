import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Clock, HardDrive } from "lucide-react";
import {
  getDownloadableContent,
  getUserDownloads,
} from "@/server/actions/downloads";
import { DownloadButton } from "@/components/content/download-button";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Downloads",
  description: "Your authorized downloads on MALIX",
};

export default async function DownloadsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [downloadableContent, userDownloads] = await Promise.all([
    getDownloadableContent(),
    getUserDownloads(),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span
            style={{
              background:
                "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Downloads
          </span>
        </h1>
        <p className="text-zinc-400">
          Authorized content available for offline viewing
        </p>
      </div>

      {/* Download History */}
      {userDownloads.length > 0 && (
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
            <h2 className="text-2xl font-bold text-white">
              Your Download History
            </h2>
            <span className="text-sm text-zinc-500">
              ({userDownloads.length})
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {userDownloads.slice(0, 10).map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                  i !== 0 ? "border-t border-white/5" : ""
                }`}
              >
                <div className="w-12 h-16 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                  {d.content.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.content.posterUrl}
                      alt={d.content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-bold">
                      M
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/content/${d.content.slug}`}
                    className="font-semibold text-white hover:text-yellow-500 transition-colors line-clamp-1"
                  >
                    {d.content.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-bold">
                      {d.quality}
                    </span>
                    {d.fileSize && (
                      <span className="flex items-center gap-1">
                        <HardDrive size={10} /> {d.fileSize}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(d.downloadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Downloads */}
      <section>
        <div className="flex items-baseline gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">
            Available for Download
          </h2>
          <span className="text-sm text-zinc-500">
            ({downloadableContent.length})
          </span>
        </div>

        {downloadableContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Download size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No downloads available yet
            </h3>
            <p className="text-zinc-400">
              Check back soon for downloadable content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadableContent.map((content) => (
              <div
                key={content.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-yellow-500/30 transition-all"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/content/${content.slug}`}
                    className="w-20 h-28 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0"
                  >
                    {content.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={content.posterUrl}
                        alt={content.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-bold">
                        MALIX
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/content/${content.slug}`}
                      className="font-bold text-white hover:text-yellow-500 transition-colors line-clamp-2 mb-1"
                    >
                      {content.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mb-2">
                      {content.releaseYear} · {content.type}
                    </p>
                    <div className="mt-auto">
                      <DownloadButton
                        contentId={content.id}
                        options={content.downloadOptions}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Legal note */}
      <div className="mt-12 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-yellow-500 font-bold">Note:</span> Only content
          with explicit download authorization is available here. All downloads
          are tracked. Redistribution of downloaded content is prohibited.
        </p>
      </div>
    </div>
  );
}
