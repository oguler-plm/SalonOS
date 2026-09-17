import { auth } from "@/lib/auth";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { SegmentGallery } from "@/components/marketing/SegmentGallery";
import { ChecklistSection } from "@/components/marketing/ChecklistSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default async function RootPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav isAuthed={Boolean(session)} />
      <Hero />
      <Features />
      <SegmentGallery />
      <ChecklistSection />
      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}
