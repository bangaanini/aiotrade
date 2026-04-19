import { notFound } from "next/navigation";
import LandingPageUI from "@/components/LandingPageUI";
import { prisma } from "@/lib/prisma";

type ReplicatedLandingPageProps = {
  params: Promise<{ username: string }>;
};

export default async function ReplicatedLandingPage({
  params,
}: ReplicatedLandingPageProps) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();
  const profile = await prisma.profile.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      isLpActive: true,
      username: true,
    },
  });

  if (!profile?.isLpActive) {
    notFound();
  }

  return (
    <LandingPageUI
      banner={`Welcome to ${profile.username}'s page!`}
      ctaHref={`/signup?ref=${encodeURIComponent(profile.username)}`}
    />
  );
}
