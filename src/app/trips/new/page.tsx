import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewTripForm } from "@/components/NewTripForm";

export default async function NewTripPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Trip</h1>
      <NewTripForm userId={userId} />
    </div>
  );
}
