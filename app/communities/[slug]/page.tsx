import Image from "next/image";
import Link from "next/link";
import Card from "@/app/components/card";
import { profile } from "console";

type CommunityPageProps = {
  params: { slug: string };
};

const communitiesData = { 
  french: {
    symbol: "🇫🇷", 
    name: "French", 
    banner: "/testing/french-banner.jpg",
    manager: "fleurir",
    members: {
      total: 52,
      online: 12,
    },
    profile: {
      points: 120,
      contributions: 10,
    }
  }, 
  chemistry: { 
    symbol: "🧪", 
    name: "Chemistry", 
    banner: "/testing/chemistry-banner.jpg", 
    members: {
      total: 43,
      online: 8,
    },
    manager: "fleurir",
    profile: {
      points: 80,
      contributions: 5,
    }
  }, 
  javascript: { 
    symbol: "💻", 
    name: "Javascript", 
    banner: "/testing/javascript-banner.jpg", 
    members: {
      total: 50,
      online: 15,
    },
    manager: "fleurir", 
    profile: {
      points: 200,
      contributions: 25,
    }
  }, 
  german: { 
    symbol: "🇩🇪", 
    name: "German", 
    banner: "/testing/german-banner.jpg", 
    members: {
      total: 36,
      online: 10,
    },
    manager: "fleurir", 
    profile: {
      points: 60,
      contributions: 8,
    }
  }, 
  quantum_physics: { 
    symbol: "⚛️", 
    name: "Quantum Physics", 
    banner: "/testing/quantum-physics-banner.jpg", 
    members: {
      total: 45,
      online: 12,
    },
    manager: "fleurir",
    profile: {
      points: 150,
      contributions: 18,
    }
  }, 
  algebra: { 
    symbol: "🧮", 
    name: "Algebra", 
    banner: "/testing/algebra-banner.jpg", 
    members: {
      total: 34,
      online: 7,
    },
    manager: "fleurir", 
    profile: {
      points: 90,
      contributions: 12,
    }
  }, 
  veterinary_medicine: { 
    symbol: "🏥", 
    name: "Veterinary Medicine", 
    banner: "/testing/veterinary-medicine-banner.jpg", 
    members: {
      total: 45,
      online: 12,
    },
    manager: "fleurir", 
    profile: {
      points: 110,
      contributions: 15,
    }
  }, 
  medicine: { 
    symbol: "⚕️", 
    name: "Medicine", 
    banner: "/testing/medicine-banner.jpg", 
    members: {
      total: 23,
      online: 5,
    },
    manager: "fleurir", 
    profile: {
      points: 130,
      contributions: 20,
    }
  }, 
  philosophy: { 
    symbol: "💭", 
    name: "Philosophy", 
    banner: "/testing/philosophy-banner.jpg", 
    members: {
      total: 37,
      online: 9,
    },
    manager: "fleurir", 
    profile: {
      points: 70,
      contributions: 9,
    }
  } 
};

export default async function CommunityPage({
  params,
}: CommunityPageProps) {
  const { slug } = await params;

  const community =
    communitiesData[slug as keyof typeof communitiesData];

  if (!community) {
    return <div className="text-white p-10">Community not found</div>;
  }

  const cards = [
    {
      id: 1,
      icon: "forum",
      title: "Forum",
      members: `${community.members.online}`,
      img: "...",
      link: `/communities/${slug}/forum`,
    },
    {
      id: 2,
      icon: "group",
      title: "Members",
      members: `${community.members.total}`,
      img: "...",
      link: `/communities/${slug}/members`,
    },
  ];

  return (
    <main className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto flex gap-6">

        <aside className="w-90 bg-white/5 rounded-3xl p-4 h-fit">
          <h2 className="leading-none tracking-tight font-medium text-2xl text-flower-blue mx-2 mt-2 mb-4">
            My communities
          </h2>

          <div className="space-y-2">
            {Object.entries(communitiesData).map(([slug, item]) => (
              <Link
                key={slug}
                href={`/communities/${slug}`}
                className={`flex justify-between items-center px-3 py-2 rounded-xl transition ${
                  slug === params.slug
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div>
                  <span className="bg-mist-950/60 rounded-lg px-2 py-1">
                    {item.symbol}
                  </span>
                  <span className="px-2">{item.name}</span>
                </div>

                <div className="bg-mist-950/60 rounded-lg px-2 py-1">
                  {item.members.total}
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-white/4 rounded-3xl overflow-hidden">
          <div className="relative h-56 w-full">
            <Image
              src={community.banner}
              alt={community.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-6xl font-light">{community.name}</h1>
                <p className="text-white/60">
                  Managed by{" "}
                  <Link
                    className="underline font-bold"
                    href={`/profile/${community.manager}`}
                  >
                    @{community.manager}
                  </Link>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="bg-flower-blue hover:bg-flower-blue/85 px-4 py-1 rounded-lg">
                  Joined
                </button>

                <div className="bg-mist-950/60 rounded-lg px-3 py-2">
                  {community.members.total}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {cards.map((item) => (
                <Card
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  memberCount={item.members}
                  bgImage={item.img}
                  link={item.link}
                />
              ))}
              </div>
              <div className="bg-white/4 rounded-2xl mt-4 p-5 flex flex-row justify-between">
                <div className="flex flex-col justify-between items-start w-full">
                  <p className="leading-none tracking-tight font-medium text-2xl pb-4">
                    Community Profile
                  </p>
                  <div className="space-y-2 text-m w-full">
                    <div className="bg-mist-950/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center flex justify-between w-full">
                      <span>Points</span>
                      <span className="text-flower-blue">{community.profile?.points || 0}</span>
                    </div>
                    <div className="bg-mist-950/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center flex justify-between w-full">
                      <span>Contributions</span>
                      <span className="text-flower-blue">{community.profile?.contributions || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-4 w-full">
                  <button className="w-fit px-5 border border-white/20 rounded-xl py-2 hover:bg-white/5">
                    Start contribution
                  </button>
                  <button className="w-fit px-5 border border-white/20 rounded-xl py-2 hover:bg-white/5">
                    Start discussion
                  </button>
                </div>
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}