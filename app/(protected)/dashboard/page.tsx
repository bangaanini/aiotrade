import Link from "next/link";
import { ExternalLink, Link2, Sparkles } from "lucide-react";
import { logoutAction } from "@/app/(protected)/dashboard/actions";
import { buildProfileUrl, getSiteUrl } from "@/lib/site";
import { requireCurrentProfile } from "@/lib/auth";
import { ActivateLandingPageButton } from "@/components/dashboard/activate-lp-button";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await requireCurrentProfile();

  const siteUrl = await getSiteUrl();
  const landingPageUrl = buildProfileUrl(siteUrl, profile.username);

  return (
    <main className="flex-1 bg-stone-50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <Sparkles className="h-4 w-4" />
                Member dashboard
              </div>

              <form action={logoutAction}>
                <Button type="submit" variant="outline">
                  Log out
                </Button>
              </form>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
                Welcome back, {profile.username}
              </h1>
              <p className="mt-2 text-base leading-7 text-stone-600">
                Manage your personal landing page and keep track of the referral connection attached to your account.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
              <CardDescription>Your current profile information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Username</p>
                <p className="mt-1 text-base font-semibold text-stone-950">@{profile.username}</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Email</p>
                <p className="mt-1 text-base font-semibold text-stone-950">{profile.email}</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Referred by</p>
                <p className="mt-1 text-base font-semibold text-stone-950">
                  {profile.referredBy ? `@${profile.referredBy}` : "Direct signup"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generate Landing Page</CardTitle>
              <CardDescription>
                Turn on your personal landing page and share a direct signup link that preserves attribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500">Status</p>
                    <p className="text-lg font-semibold text-stone-950">
                      {profile.isLpActive ? "Active and shareable" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {profile.isLpActive ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-sm font-medium text-emerald-800">Your replicated landing page</p>
                    <p className="mt-2 break-all text-sm text-emerald-900">{landingPageUrl}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <CopyLinkButton link={landingPageUrl} />
                    <Link href={`/${profile.username}`} target="_blank">
                      <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 transition hover:bg-stone-50">
                        <ExternalLink className="h-4 w-4" />
                        Open Page
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <ActivateLandingPageButton />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
