import dynamicImport from "next/dynamic";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Dynamically import the client component
const ProfilePageClient = dynamicImport(
  () => import("@/components/ProfilePageClient"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export default function ProfilePage() {
  return <ProfilePageClient />;
}
