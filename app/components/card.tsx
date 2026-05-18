interface CommunityCardProps {
    icon: string;
    title: string;
    memberCount: number | string;
    bgImage: string;
    link: string;
}

export default function CommunityCard({ icon, title, memberCount, bgImage, link }: CommunityCardProps) {
  return (
    <a href={link}>
    <div 
      className="relative h-auto rounded-2xl p-4 bg-white/4 bg-center overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:scale-[1.02]"
    >
        <div className="flex items-center justify-between gap-4 z-10">
            <div className="text-white">
            <p className="leading-none tracking-tight font-medium text-2xl">{title}</p>
            </div>
            { icon ? (
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-2 text-center flex items-center gap-1">
                    <span className="text-white icon icon-rounded icon-filled icon-24">{icon}</span>
                    <p className="text-white leading-none tracking-tight text-xl">{memberCount}</p>
                </div>
            ) : (
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-2 text-center flex items-center">
                    <span></span>
                    <p className="text-white leading-none tracking-tight text-xl">{memberCount}</p>
                </div>
            )}
        </div>
    </div>
    </a>
  );
}