import Link from "next/link";
import { Wand2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center glow">
          <Wand2 className="w-12 h-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400">
            The magic you&apos;re looking for doesn&apos;t exist at this location.
          </p>
        </div>

        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
