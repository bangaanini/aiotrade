import { HomepageSettingsView } from "@/components/admin/homepage-settings-view";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { getHomepageAssets } from "@/lib/homepage-assets";
import { getHomepageContent } from "@/lib/homepage-content";
import { getRegisterReferralWhatsapp } from "@/lib/register-referral-profile";

type AdminPageProps = {
  searchParams: Promise<{
    section?: string;
    status?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [assets, content, registerReferralWhatsapp, query] = await Promise.all([
    getHomepageAssets(),
    getHomepageContent(),
    getRegisterReferralWhatsapp(),
    searchParams,
  ]);

  return (
    <HomepageSettingsView
      assets={assets}
      cloudinaryEnabled={isCloudinaryConfigured()}
      content={content}
      registerReferralWhatsapp={registerReferralWhatsapp}
      section={query.section}
      status={query.status}
    />
  );
}
