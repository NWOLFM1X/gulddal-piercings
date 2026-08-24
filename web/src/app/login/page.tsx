import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Log ind",
  description: "Log ind for at booke og se dine bookinger.",
};

export const dynamic = "force-dynamic";

function safeReturnTo(value?: string): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const { returnTo: rawReturnTo, error } = await searchParams;
  const returnTo = safeReturnTo(rawReturnTo);

  const session = await getSession();
  if (session) {
    redirect(returnTo ?? "/mine-bookinger");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <Reveal>
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-pink-900">
            Log ind
          </h1>
          <p className="mt-3 text-pink-900/70">
            Indtast din email, så sender vi dig et login-link. Ingen adgangskode
            nødvendig.
          </p>
        </div>
      </Reveal>

      {error === "expired" && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-center text-sm text-red-600">
          Login-linket er udløbet eller ugyldigt. Prøv igen.
        </p>
      )}

      <Reveal delay={0.1}>
        <LoginForm returnTo={returnTo} />
      </Reveal>
    </div>
  );
}
