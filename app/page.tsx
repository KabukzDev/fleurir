import Image from "next/image"
import Navbar from "@/app/components/navbar"
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/home")
  }

  return (
  <div className="px-12 flex flex-col items-start justify-start text-left gap-6 mt-25">
    <h1 className="font-family-name:--font-heading) tracking-tight text-8xl italic font-semibold text-white">
      Learn better. <br></br> Grow faster. <br></br><span className="text-flower-blue">Fleurir.</span>
    </h1>
    <a href="/login" className="text-xl px-6 py-2 bg-flower-blue text-white rounded-md hover:bg-flower-blue/90 transition">
      Get Started
    </a>
  </div>
  );
}
