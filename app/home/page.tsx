import Activity from "@/app/components/activity"
import Card from "@/app/components/card"
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

    const recentActivities = [
        { id: '1', userImage: '/testing/lyuk.png', userName: 'Lyuk', subject: 'French', points: 5, type: 'gave' as const },
        { id: '2', userImage: '/testing/sarah.png', userName: 'Sarah', subject: 'Quantum Physics', points: 15, type: 'gave' as const },
        { id: '3', userImage: '/testing/arjun.png', userName: 'Arjun', subject: 'Biology', points: 10, type: 'received' as const },
    ];

    const communities = [
        { id: 1, icon:"diversity_3", title: "My communities", members: 12, img: "..." },
        { id: 2, icon:"group", title: "My friends", members: 94, img: "..." },
        { id: 3, icon:"person_raised_hand", title: "My collaborations", members: 70, img: "..." },
    ];
    
    return (
    <div className="px-10 py-2">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-family-name:--font-heading) tracking-tight text-6xl font-light text-white">
                    What's up, {user.name}
                </h1>
                <p className="text-white pb-4">
                    You’re currently <span className="font-bold">257</span> points away from <a className="underline font-bold" href="/leagues">Einstein’s League</a>
                </p>
                <div className="bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(https://blog.sothebysrealty.co.uk/hs-fs/hubfs/Imported_Blog_Media/Best%20Places%20to%20Live%20in%20France-jpg.jpg?width=1600&height=1068&name=Best%20Places%20to%20Live%20in%20France-jpg.jpg)] bg-cover bg-center h-40 w-120 rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="text-white">
                            <p className="leading-none tracking-tight">Continue learning in</p>
                            <p className="leading-none tracking-tight font-medium text-2xl">French</p>
                        </div>
                        <div className="bg-black/60 rounded-lg px-2 py-2 text-center">
                            <p className="text-white leading-none tracking-tight text-xl flex items-center justify-center gap-1"><span className="icon icon-rounded icon-filled icon-24">group</span> 48</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Activity userImage={user.image} activities={recentActivities} />
            </div>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((item) => (<Card key={item.id} icon={item.icon} title={item.title} memberCount={item.members} bgImage={item.img}/>))}
        </div>
    </div>
    );
}