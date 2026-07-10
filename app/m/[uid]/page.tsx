import { ManagerProfilePage } from "@/components/v2/manager-profile/ManagerProfilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;

  return <ManagerProfilePage uid={uid} />;
}
