import React from 'react';

interface Activity {
  id: string;
  userImage: string;
  userName: string;
  subject: string;
  points: number;
  type: 'gave' | 'received';
}

interface UserProfileProps {
  userImage: string;
  activities: Activity[];
}

const ActivityProfile: React.FC<UserProfileProps> = ({ userImage, activities }) => {
  const size = 240;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = 0.9;
  const offset = circumference - progressPercent * circumference;

  return (
    <div className="tracking-tight relative flex items-center justify-evenly w-auto h-full">
      <div className="inset-0 pointer-events-none">
        {activities.map((item, index) => (
          <div 
            key={item.id}
            className={`relative flex items-center gap-2 pointer-events-auto px-5
              ${index === 0 ? 'bottom-3 left-14' : ''}
              ${index === 1 ? '' : ''}
              ${index === 2 ? 'top-3 left-20' : ''}
            `}
          >
            {/* Text Bubble */}
            <div className="bg-[#1e1e1e] border border-white/10 px-4 py-2 rounded-xl text-white text-sm">
              {item.type === 'gave' ? (
                <span>You helped <a className="underline" href={`/profile/${item.userName.toLowerCase()}`}>{item.userName}</a> with <a className="underline" href={`/communities/${item.subject.toLowerCase().trim().replace(/\s+/g, "_")}`}>{item.subject}</a></span>
              ) : (
                <span><a className="underline" href={`/profile/${item.userName.toLowerCase()}`}>{item.userName}</a> helped you on <a className="underline" href={`/communities/${item.subject.toLowerCase().trim().replace(/\s+/g, "_")}`}>{item.subject}</a></span>
              )}
            </div>

            {/* Avatar + Point Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                <img src={item.userImage} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1d72ff] text-white text-[12px] font-medium px-2 py-0.5 rounded-full">
                +{item.points}
              </div>
            </div>
          </div>
        ))}
      </div>

    <div className="relative w-60 h-60">
        <img className="w-full h-full rounded-full object-cover" src={userImage} />
        <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
          <circle cx="50%" cy="50%" r={radius} stroke="#2a2a2a" strokeWidth="8" fill="none" />
          <circle cx="50%" cy="50%" r={radius} stroke="#1d72ff" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
        </svg>
      </div>
    </div>
  );
};

export default ActivityProfile;