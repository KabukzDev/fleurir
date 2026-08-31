import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
  const [user, locale] = await Promise.all([
    getUser(),
    getLocale(),
  ]);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="px-12 flex flex-col items-start justify-start text-left gap-6 mt-25">
      <h1 className="tracking-tight text-7xl sm:text-8xl italic font-semibold text-white">
        {locale === "es" ? (
          <>
            Aprende mejor. <br /> Crece más rápido. <br /><span className="text-flower-blue">Fleurir.</span>
          </>
        ) : (
          <>
            Learn better. <br /> Grow faster. <br /><span className="text-flower-blue">Fleurir.</span>
          </>
        )}
      </h1>
      <a href="/login" className="text-xl px-6 py-2 bg-flower-blue text-white rounded-xl hover:bg-flower-blue/90 transition cursor-pointer font-medium">
        {locale === "es" ? "Comenzar" : "Get Started"}
      </a>
    </div>
  );
}
