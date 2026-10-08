import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Clock, HardDrive } from "lucide-react";
import {
  getDownloadableContent,
  getUserDownloads,
} from "@/server/actions/downloads";
import { DownloadButton } from "@/components/content/download-button";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

      {userDownloads.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Your Download History
            </h2>
          </div>

          <div className="glass-cosmic rounded-2xl overflow-hidden divide-y divide-white/5">
            {userDownloads.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                  {item.content?.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.content.posterUrl}
                      alt={item.content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700 font-bold">
                      MALIX
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {item.content?.title || "Unknown"}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <HardDrive size={10} />
                      {item.quality}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                  {item.status || "completed"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Available for Download
          </h2>
        </div>

        {downloadableContent.length === 0 ? (
          <div className="glass-cosmic rounded-2xl p-12 text-center">
            <Download size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">
              No downloadable content available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {downloadableContent.map((item: any) => (
              <div key={item.id} className="glass-cosmic rounded-xl overflow-hidden">
                <Link href={`/content/${item.slug}`} className="block">
                  <div className="aspect-[2/3] bg-zinc-900 overflow-hidden">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-bold tracking-widest">
                        MALIX
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <div className="text-sm font-semibold text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {item.type} {item.releaseYear && `• ${item.releaseYear}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}