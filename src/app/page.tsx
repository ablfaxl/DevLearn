import { LandingCourses } from "@/components/landing/landing-courses";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNewsletter } from "@/components/landing/landing-newsletter";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingTrustStrip } from "@/components/landing/landing-trust-strip";
import { LmsCategoryPills } from "@/components/lms/lms-category-pills";
import { LmsContinueLearning } from "@/components/lms/lms-continue-learning";
import { LmsHomeSearch } from "@/components/lms/lms-home-search";
import { LmsWelcomeBar } from "@/components/lms/lms-welcome-bar";
import { getFeaturedCoursesPreview } from "@/lib/data/featured-courses-server";
import { getPublicStats } from "@/lib/data/stats-server";

export default async function Home() {
  const [featured, stats] = await Promise.all([getFeaturedCoursesPreview(), getPublicStats()]);

  return (
    <div className="flex flex-col">
      <LmsWelcomeBar />
      <LmsHomeSearch />
      <LmsContinueLearning courses={featured} />
      <LmsCategoryPills />
      <LandingHero />
      <LandingTrustStrip />
      <LandingStats stats={stats} />
      <LandingFeatures />
      <LandingCourses featured={featured} />
      <LandingTestimonials />
      <LandingNewsletter />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
