import Navbar from "@/app/components/navbar"
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
      const user = await getUser();
    
      if (!user) {
        redirect("/login");
      }
    
    return (
    <div className="px-10 py-2">
        <div>
            <h1 className="font-family-name:--font-heading) tracking-tight text-6xl font-light text-white">
                What's up, {user.name}
            </h1>
            <p className="text-white">
                You’re currently <span className="font-bold">257</span> points away from <a className="underline font-bold" href="site">Einstein’s League</a>
            </p>
        </div>
    </div>
    );
}