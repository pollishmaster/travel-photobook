import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
            Share Your Travel Stories
          </h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Create beautiful photo albums of your adventures and share them with
            friends and family
          </p>
          <Link
            href={isSignedIn ? "/trips/new" : "/sign-in"}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            {isSignedIn ? "Start Your Journey" : "Sign In to Begin"}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything you need to document your travels
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Photo Albums"
              description="Upload and organize your travel photos in beautiful albums"
              icon="📸"
            />
            <FeatureCard
              title="Travel Documents"
              description="Keep all your tickets and reservations in one place"
              icon="🎫"
            />
            <FeatureCard
              title="Easy Sharing"
              description="Share your travel stories with a simple link"
              icon="🔗"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
