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
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = 0.9;
  const offset = circumference - progressPercent * circumference;

  return (
    <div className="tracking-tight relative flex items-center justify-end gap-1 w-full max-w-full">
      {/* Activity bubbles - dynamically visible only on large screens (xl+) to prevent collision */}
      {activities && activities.length > 0 && (
        <div className="hidden xl:flex flex-col items-end shrink">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2.5 backdrop-blur-md transition-all"
            >
              {/* Text Bubble */}
              <div className="text-white text-sm whitespace-nowrap pl-2">
                {item.type === 'gave' ? (
                  <span>
                    You helped{' '}
                    <a className="underline font-medium hover:text-flower-blue" href={`/profile/${item.userName.toLowerCase()}`}>
                      {item.userName}
                    </a>{' '}
                    with{' '}
                    <a className="underline font-medium hover:text-flower-blue" href={`/communities/${item.subject.toLowerCase().trim().replace(/\s+/g, '_')}`}>
                      {item.subject}
                    </a>
                  </span>
                ) : (
                  <span>
                    <a className="underline font-medium hover:text-flower-blue" href={`/profile/${item.userName.toLowerCase()}`}>
                      {item.userName}
                    </a>{' '}
                    helped you on{' '}
                    <a className="underline font-medium hover:text-flower-blue" href={`/communities/${item.subject.toLowerCase().trim().replace(/\s+/g, '_')}`}>
                      {item.subject}
                    </a>
                  </span>
                )}
              </div>

              {/* Avatar + Point Badge */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden">
                  <img src={item.userImage} alt={item.userName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1d72ff] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full shadow">
                  +{item.points}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Profile Avatar with SVG Ring - shrink-0 to NEVER squish or deform */}
      <div className="relative shrink-0 w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56">
        <img
          className="w-full h-full rounded-full object-cover p-2"
          src={userImage}
          alt="User Profile"
        />
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={radius} stroke="#2a2a2a" strokeWidth="6" fill="none" />
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke="#1d72ff"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
      </div>
    </div>
  );
};

export default ActivityProfile;