import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StarField } from "@/components/effects/star-field";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { fetchCurrentUser } from "@/server/actions/user";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 👇 User fetch karo taake Navbar ko pass karein
  const user = await fetchCurrentUser();

  return (
    <div className="relative min-h-screen flex flex-col bg-space-deep">
      <StarField />
      <CursorGlow />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar user={user} /> {/* 👈 user prop pass kiya */}
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}