import {
    getAllCommunities,
    getUserCollaborations,
    getUserFriends,
    getUserLeagueHighlight,
} from "@/lib/demo-social";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Activity from "@/app/components/activity";
import Card from "@/app/components/card";

export const metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
    const user = await getUser();

    if (!user) {
    redirect("/login");
    }

    const [communities, friends, collaborations, leagueHighlight] = await Promise.all([
        getAllCommunities(),
        getUserFriends(user.id),
        getUserCollaborations(user.id),
        getUserLeagueHighlight(user.id),
    ]);
    const french = communities.find((community) => community.slug === "french");

    const recentActivities = [
        { id: '1', userImage: '/testing/lucas.jpg', userName: 'Lucas', subject: 'Chemistry', points: 21, type: 'gave' as const },
        { id: '2', userImage: '/testing/maya.jpg', userName: 'Maya', subject: 'Quantum Physics', points: 47, type: 'gave' as const },
        { id: '3', userImage: '/testing/noah.jpg', userName: 'Noah', subject: 'Medicine', points: 25, type: 'received' as const },
    ];

    const buttons = [
        { id: 1, icon:"diversity_3", title: "My communities", members: communities.length, img: "...", link: "/communities" },
        { id: 2, icon:"group", title: "My friends", members: friends.length, img: "...", link: "/friends" },
        { id: 3, icon:"person_raised_hand", title: "My collaborations", members: collaborations.length, img: "...", link: "/collaborations" },
    ];
    
    return (
    <div className="px-10 py-2">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-family-name:--font-heading) tracking-tight text-6xl pb-3 font-light text-white">
                    What's up, {user.name}
                </h1>
                {leagueHighlight && (
                <p className="text-white pb-4">
                    {leagueHighlight.aheadOf ? (
                        <>
                            You&apos;re currently <span className="font-bold">{leagueHighlight.aheadOf.diff}</span> points ahead of{" "}
                            <a className="underline font-bold" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                                {leagueHighlight.aheadOf.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold" href="/leagues">
                                {leagueHighlight.leagueName} League
                            </a>
                        </>
                    ) : leagueHighlight.behind ? (
                        <>
                            You&apos;re <span className="font-bold">{leagueHighlight.behind.diff}</span> points behind{" "}
                            <a className="underline font-bold" href={`/profile/${leagueHighlight.behind.username}`}>
                                {leagueHighlight.behind.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold" href="/leagues">
                                {leagueHighlight.leagueName} League
                            </a>
                        </>
                    ) : (
                        <>
                            You&apos;re leading the{" "}
                            <a className="underline font-bold" href="/leagues">
                                {leagueHighlight.leagueName} League
                            </a>
                        </>
                    )}
                </p>
                )}
                <a href="/communities/french/forum">
                    <div className="bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(/testing/french-banner.jpg)] bg-cover bg-center h-40 w-120 rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-white">
                                <p className="leading-none tracking-tight">Continue learning in</p>
                                <p className="leading-none tracking-tight font-medium text-2xl">French</p>
                            </div>
                            <div className="bg-black/60 rounded-lg px-2 py-2 text-center">
                                <p className="text-white leading-none tracking-tight text-xl flex items-center justify-center gap-1"><span className="icon icon-rounded icon-filled icon-24">forum</span>{french?.members.online || 0}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            <div>
                <Activity userImage={user.image} activities={recentActivities} />
            </div>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buttons.map((item) => (<Card key={item.id} icon={item.icon} title={item.title} memberCount={item.members} bgImage={item.img} link={item.link}/>))}
        </div>
    </div>
    );
}
