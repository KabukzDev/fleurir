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
import { getLocale, getDictionary } from "@/lib/i18n/server";
import Activity from "@/app/components/activity";
import Card from "@/app/components/card";

export const metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
    const [user, locale] = await Promise.all([
        getUser(),
        getLocale(),
    ]);

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

    const lastCommunitySlug =
        collaborations[0]?.communitySlug ||
        recentActivities[0]?.communitySlug ||
        myCommunities[0]?.slug;

    const lastCommunity = lastCommunitySlug ? allCommunities.find((community) => community.slug === lastCommunitySlug) : null;
    const dict = getDictionary(locale);

    const buttons = [
        { id: 1, icon:"diversity_3", title: dict.dashboard.myCommunities, members: myCommunities.length, img: "...", link: "/communities" },
        { id: 2, icon:"group", title: dict.dashboard.myFriends, members: friends.length, img: "...", link: "/friends" },
        { id: 3, icon:"person_raised_hand", title: dict.dashboard.myCollaborations, members: collaborations.length, img: "...", link: "/collaborations" },
    ];
    
    return (
    <div className="px-6 md:px-10 py-4 max-w-7xl mx-auto space-y-10 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 min-w-0">
            <div className="min-w-0 flex-1">
                <h1 className="tracking-tight text-4xl sm:text-5xl md:text-6xl pb-3 font-light text-white truncate">
                    {dict.dashboard.greeting} {user.name}
                </h1>
                {leagueHighlight && (
                  <p className="text-white/80 pb-4 text-sm sm:text-base">
                    {leagueHighlight.leagueId === "diamond" ? (
                      leagueHighlight.aheadOf ? (
                        locale === "es" ? (
                          <>
                            Estás a <span className="font-bold text-white">{leagueHighlight.aheadOf.diff}</span> puntos por delante de{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                              {leagueHighlight.aheadOf.displayName}
                            </a>{" "}
                            en la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>
                          </>
                        ) : (
                          <>
                            You&apos;re currently <span className="font-bold text-white">{leagueHighlight.aheadOf.diff}</span> points ahead of{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                              {leagueHighlight.aheadOf.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>
                          </>
                        )
                      ) : leagueHighlight.behind ? (
                        locale === "es" ? (
                          <>
                            Estás a <span className="font-bold text-white">{leagueHighlight.behind.diff}</span> puntos por detrás de{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.behind.username}`}>
                              {leagueHighlight.behind.displayName}
                            </a>{" "}
                            en la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>
                          </>
                        ) : (
                          <>
                            You&apos;re <span className="font-bold text-white">{leagueHighlight.behind.diff}</span> points behind{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.behind.username}`}>
                              {leagueHighlight.behind.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>
                          </>
                        )
                      ) : (
                        locale === "es" ? (
                          <>
                            ¡Has alcanzado la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>! Sigue colaborando para mantener tu puesto en la cima.
                          </>
                        ) : (
                          <>
                            You&apos;ve reached the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers.diamond}
                            </a>! Keep collaborating to maintain your top rank.
                          </>
                        )
                      )
                    ) : leagueHighlight.pointsToNextTier > 0 && leagueHighlight.nextLeagueName ? (
                      <>
                        {locale === "es" ? (
                          <>
                            Estás a <span className="font-bold text-white">{leagueHighlight.pointsToNextTier}</span> puntos de la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.nextLeagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `Liga ${leagueHighlight.nextLeagueName}`}
                            </a>{" "}
                            en la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `Liga ${leagueHighlight.leagueName}`}
                            </a>
                          </>
                        ) : (
                          <>
                            You&apos;re currently <span className="font-bold text-white">{leagueHighlight.pointsToNextTier}</span> points away from{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.nextLeagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `${leagueHighlight.nextLeagueName} League`}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `${leagueHighlight.leagueName} League`}
                            </a>
                          </>
                        )}
                      </>
                    ) : leagueHighlight.aheadOf ? (
                      <>
                        {locale === "es" ? (
                          <>
                            Estás a <span className="font-bold text-white">{leagueHighlight.aheadOf.diff}</span> puntos por delante de{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                              {leagueHighlight.aheadOf.displayName}
                            </a>{" "}
                            en la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `Liga ${leagueHighlight.leagueName}`}
                            </a>
                          </>
                        ) : (
                          <>
                            You&apos;re currently <span className="font-bold text-white">{leagueHighlight.aheadOf.diff}</span> points ahead of{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.aheadOf.username}`}>
                              {leagueHighlight.aheadOf.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `${leagueHighlight.leagueName} League`}
                            </a>
                          </>
                        )}
                      </>
                    ) : leagueHighlight.behind ? (
                      <>
                        {locale === "es" ? (
                          <>
                            Estás a <span className="font-bold text-white">{leagueHighlight.behind.diff}</span> puntos por detrás de{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.behind.username}`}>
                              {leagueHighlight.behind.displayName}
                            </a>{" "}
                            en la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `Liga ${leagueHighlight.leagueName}`}
                            </a>
                          </>
                        ) : (
                          <>
                            You&apos;re <span className="font-bold text-white">{leagueHighlight.behind.diff}</span> points behind{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href={`/profile/${leagueHighlight.behind.username}`}>
                              {leagueHighlight.behind.displayName}
                            </a>{" "}
                            in the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `${leagueHighlight.leagueName} League`}
                            </a>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {locale === "es" ? (
                          <>
                            ¡Estás liderando la{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `Liga ${leagueHighlight.leagueName}`}
                            </a>!
                          </>
                        ) : (
                          <>
                            You&apos;re leading the{" "}
                            <a className="underline font-bold text-white hover:text-flower-blue" href="/leagues">
                              {dict.leagues.tiers[leagueHighlight.leagueName.toLowerCase() as keyof typeof dict.leagues.tiers] || `${leagueHighlight.leagueName} League`}
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}
                {lastCommunity ? (
                  <a href={`/communities/${lastCommunity.slug}/forum`} className="block max-w-md">
                    <div 
                      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${lastCommunity.banner || "/banners/french-banner.jpg"})` }}
                      className="bg-cover bg-center h-40 w-full rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-white">
                          <p className="leading-none tracking-tight text-sm">{dict.dashboard.continueCollaborating}</p>
                          <p className="leading-none tracking-tight font-medium text-2xl mt-1">{lastCommunity.name}</p>
                        </div>
                        <div className="bg-black/60 rounded-lg px-2.5 py-1.5 text-center backdrop-blur-sm">
                          <p className="text-white leading-none tracking-tight text-lg flex items-center justify-center gap-1.5">
                            <span className="icon icon-rounded icon-filled icon-20">forum</span>
                            {lastCommunity.members.online || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <a href="/discover" className="block max-w-md">
                    <div className="bg-white/5 border border-white/10 hover:border-flower-blue/50 hover:bg-white/10 transition h-40 w-full rounded-2xl p-5 cursor-pointer flex flex-col justify-between group">
                      <div>
                        <span className="text-flower-blue text-xs font-semibold uppercase tracking-wider px-2 py-1 bg-flower-blue/15 rounded-md">
                          {locale === "es" ? "Comunidades" : "Communities"}
                        </span>
                        <p className="text-white font-light text-xl mt-2 leading-snug">
                          {dict.dashboard.noJoinedCommunities}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-flower-blue text-sm font-medium pt-2">
                        <span>{dict.dashboard.joinCommunityCta}</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </a>
                )}
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
