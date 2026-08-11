import {
    getAllCommunities,
    getUserJoinedCommunities,
    getUserCollaborations,
    getUserFriends,
    getUserLeagueHighlight,
    getUserRecentActivities,
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

    const [allCommunities, myCommunities, friends, collaborations, leagueHighlight, recentActivities] = await Promise.all([
        getAllCommunities(),
        getUserJoinedCommunities(user.id),
        getUserFriends(user.id),
        getUserCollaborations(user.id),
        getUserLeagueHighlight(user.id),
        getUserRecentActivities(user.id),
    ]);
    const french = allCommunities.find((community) => community.slug === "french");

    const buttons = [
        { id: 1, icon:"diversity_3", title: "My communities", members: myCommunities.length, img: "...", link: "/communities" },
        { id: 2, icon:"group", title: "My friends", members: friends.length, img: "...", link: "/friends" },
        { id: 3, icon:"person_raised_hand", title: "My collaborations", members: collaborations.length, img: "...", link: "/collaborations" },
    ];
    
    return (
    <div className="px-6 md:px-10 py-4 max-w-7xl mx-auto space-y-10 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 min-w-0">
            <div className="min-w-0 flex-1">
                <h1 className="tracking-tight text-4xl sm:text-5xl md:text-6xl pb-3 font-light text-white truncate">
                    What's up, {user.name}
                </h1>
                {leagueHighlight && (
                  <p className="text-white/80 pb-4 text-sm sm:text-base">
                    {leagueHighlight.pointsToNextTier > 0 ? (
                      <>
                        You&apos;re currently <span className="font-bold text-white">{leagueHighlight.pointsToNextTier}</span> points away from{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                          {leagueHighlight.nextLeagueName} League
                        </a>{" "}
                        in the{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                          {leagueHighlight.leagueName} League
                        </a>
                      </>
                    ) : leagueHighlight.aheadOf ? (
                      <>
                        You&apos;re currently <span className="font-bold text-white">{leagueHighlight.aheadOf.diff}</span> points ahead of{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                          {leagueHighlight.aheadOf.displayName}
                        </a>{" "}
                        in the{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                          {leagueHighlight.leagueName} League
                        </a>
                      </>
                    ) : leagueHighlight.behind ? (
                      <>
                        You&apos;re <span className="font-bold text-white">{leagueHighlight.behind.diff}</span> points behind{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.behind.username}`}>
                          {leagueHighlight.behind.displayName}
                        </a>{" "}
                        in the{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                          {leagueHighlight.leagueName} League
                        </a>
                      </>
                    ) : (
                      <>
                        You&apos;re leading the{" "}
                        <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                          {leagueHighlight.leagueName} League
                        </a>
                      </>
                    )}
                  </p>
                )}
                <a href="/communities/french/forum" className="block max-w-md">
                    <div className="bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(/banners/french-banner.jpg)] bg-cover bg-center h-40 w-full rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-white">
                                <p className="leading-none tracking-tight text-sm">Continue learning in</p>
                                <p className="leading-none tracking-tight font-medium text-2xl mt-1">French</p>
                            </div>
                            <div className="bg-black/60 rounded-lg px-2.5 py-1.5 text-center backdrop-blur-sm">
                                <p className="text-white leading-none tracking-tight text-lg flex items-center justify-center gap-1.5">
                                    <span className="icon icon-rounded icon-filled icon-20">forum</span>
                                    {french?.members.online || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            <div className="shrink-0 self-center lg:self-auto">
                <Activity userImage={user.image} activities={recentActivities} progressPercent={leagueHighlight?.progressPercent} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buttons.map((item) => (
                <Card key={item.id} icon={item.icon} title={item.title} memberCount={item.members} bgImage={item.img} link={item.link}/>
            ))}
        </div>
    </div>
    );
}
