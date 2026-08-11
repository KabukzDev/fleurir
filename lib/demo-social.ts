import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserProfile = {
  username: string;
  image: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  points: number;
  joinedAt: string;
  interests: string[];
  isOnline: boolean;
};

export type Community = {
  slug: string;
  symbol: string;
  name: string;
  banner: string;
  manager: string;
  description: string;
  members: {
    total: number;
    online: number;
  };
  profile: {
    points: number;
    contributions: number;
  };
};

export type Reply = {
  id: string;
  author: string;
  content: string;
};

export type Comment = {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  accepted?: boolean;
  replies: Reply[];
};

export type ForumPost = {
  id: string;
  title: string;
  type: string;
  content: string;
  author: string;
  communitySlug: string;
  upvotes: number;
  replies: number;
  solved: boolean;
  tags: string[];
  comments: Comment[];
  createdAt?: string;
};

export type Collaboration = {
  id: string;
  communitySlug: string;
  communityName: string;
  communitySymbol: string;
  postId: string;
  postTitle: string;
  type: string;
  action: "asked" | "answered" | "replied";
  points: number;
  collaboratorUsernames: string[];
  tags: string[];
  solved: boolean;
};

export type Friend = UserProfile & {
  sharedCommunities: string[];
  sharedCommunitySlugs: string[];
  collaborations: number;
  lastActive: string;
};

export type UserContributionStats = {
  posts: number;
  comments: number;
  replies: number;
  acceptedAnswers: number;
  points: number;
  communities: {
    slug: string;
    name: string;
    symbol: string;
    contributions: number;
  }[];
};

export type League = {
  id: string;
  tier: string;
  name: string;
  threshold: string;
  accent: string;
  banner: string;
};

export type LeaderboardEntry = {
  username: string;
  displayName: string;
  image?: string;
  score: number;
  collaborations: number;
  isPromotionZone?: boolean;
  isDemotionZone?: boolean;
};

type DbProfile = {
  username: string;
  image: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  points: number;
  joined_at: string;
  interests: string[];
  is_online: boolean;
};

type DbCommunity = {
  slug: string;
  symbol: string;
  name: string;
  banner: string;
  manager_username: string;
  description: string;
  profile_points: number;
  profile_contributions: number;
};

type DbReply = {
  id: string;
  author_username: string;
  content: string;
};

type DbComment = {
  id: string;
  author_username: string;
  content: string;
  attachment_url?: string;
  upvotes: number;
  accepted: boolean;
  comment_replies?: DbReply[];
};

type DbPost = {
  id: string;
  community_slug: string;
  title: string;
  type: string;
  content: string;
  author_username: string;
  upvotes: number;
  solved: boolean;
  tags: string[];
  created_at: string;
  comments?: DbComment[];
};

type DbLeague = {
  id: string;
  tier: string;
  name: string;
  threshold: string;
  accent: string;
  banner: string;
  sort_order: number;
};

type DbLeagueEntry = {
  league_id: string;
  username: string;
  display_name: string;
  score: number;
  collaborations: number;
};

function normalizeProfile(profile: DbProfile): UserProfile {
  return {
    username: profile.username,
    image: profile.image,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    bio: profile.bio,
    location: profile.location,
    points: profile.points,
    joinedAt: profile.joined_at,
    interests: profile.interests || [],
    isOnline: profile.is_online,
  };
}

function normalizePost(post: DbPost): ForumPost {
  const comments = (post.comments || []).map((comment) => ({
    id: comment.id,
    author: comment.author_username,
    content: comment.content,
    attachmentUrl: comment.attachment_url,
    upvotes: comment.upvotes,
    accepted: comment.accepted,
    replies: (comment.comment_replies || []).map((reply) => ({
      id: reply.id,
      author: reply.author_username,
      content: reply.content,
    })),
  }));

  return {
    id: post.id,
    title: post.title,
    type: post.type,
    content: post.content,
    author: post.author_username,
    communitySlug: post.community_slug,
    upvotes: post.upvotes,
    replies: comments.length,
    solved: post.solved,
    tags: post.tags || [],
    comments,
    createdAt: post.created_at,
  };
}

async function getProfilesMap() {
  const profiles = await getAllUsers();

  return new Map(profiles.map((profile) => [profile.username, profile]));
}

export async function getAllUsers() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data || []).map((profile) => normalizeProfile(profile as DbProfile));
}

export async function getUserProfile(username: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;

  return data ? normalizeProfile(data as DbProfile) : null;
}

export async function getRawCommunities() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data || []) as DbCommunity[];
}

export async function getForumPosts(slug?: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select("*, comments(*, comment_replies(*))")
    .order("created_at", { ascending: false });

  if (slug) {
    query = query.eq("community_slug", slug);
  }

  const { data, error } = await query;

  if (error) throw error;

  return ((data || []) as DbPost[]).map(normalizePost);
}

export async function getForumPost(slug: string, postId: string) {
  const posts = await getForumPosts(slug);

  return posts.find((post) => post.id === postId) || null;
}

export async function isUserCommunityMember(slug: string, username: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !username) return false;

  const { data } = await supabase
    .from("community_members")
    .select("username")
    .eq("community_slug", slug)
    .eq("username", username)
    .maybeSingle();

  return Boolean(data);
}

export async function getUserJoinedCommunities(username: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !username) return [];

  const { data } = await supabase
    .from("community_members")
    .select("community_slug")
    .eq("username", username);

  if (!data || data.length === 0) return [];

  const joinedSlugs = new Set(data.map((r) => r.community_slug));
  const communities = await getAllCommunities();

  return communities.filter((c) => joinedSlugs.has(c.slug));
}

export async function isUserFriend(userUsername: string, friendUsername: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !userUsername || !friendUsername) return false;

  const { data } = await supabase
    .from("friends")
    .select("id")
    .eq("user_username", userUsername)
    .eq("friend_username", friendUsername)
    .maybeSingle();

  return Boolean(data);
}

export async function getAllCommunities() {
  const supabase = await createSupabaseServerClient();
  const [communities, profiles] = await Promise.all([
    getRawCommunities(),
    getProfilesMap(),
  ]);

  let memberRows: { community_slug: string; username: string }[] = [];
  if (supabase) {
    const { data } = await supabase.from("community_members").select("community_slug, username");
    memberRows = data || [];
  }

  const memberMap = new Map<string, Set<string>>();
  for (const row of memberRows) {
    const set = memberMap.get(row.community_slug) || new Set();
    set.add(row.username);
    memberMap.set(row.community_slug, set);
  }

  return communities.map((community) => {
    const usernames = memberMap.get(community.slug) || new Set();
    const members = [...usernames]
      .map((username) => profiles.get(username))
      .filter(Boolean) as UserProfile[];

    return {
      slug: community.slug,
      symbol: community.symbol,
      name: community.name,
      banner: community.banner,
      manager: community.manager_username,
      description: community.description,
      members: {
        total: members.length,
        online: members.filter((member) => member.isOnline).length,
      },
      profile: {
        points: community.profile_points,
        contributions: community.profile_contributions,
      },
    };
  });
}

export async function getCommunity(slug: string) {
  const communities = await getAllCommunities();

  return communities.find((community) => community.slug === slug) || null;
}

export async function getCommunityMembers(slug: string) {
  const supabase = await createSupabaseServerClient();
  const [community, posts, profiles] = await Promise.all([
    getRawCommunities().then((items) =>
      items.find((item) => item.slug === slug)
    ),
    getForumPosts(slug),
    getProfilesMap(),
  ]);

  if (!community) return [];

  let memberUsernames: string[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("community_members")
      .select("username")
      .eq("community_slug", slug);
    memberUsernames = (data || []).map((r) => r.username);
  }

  return memberUsernames
    .map((username) => profiles.get(username))
    .filter(Boolean)
    .map((profile) => {
      const username = profile!.username;
      let contributions = 0;

      for (const post of posts) {
        if (post.author === username) contributions += 2;
        for (const comment of post.comments) {
          if (comment.author === username) contributions += 1;
          contributions += comment.replies.filter(
            (reply) => reply.author === username
          ).length;
        }
      }

      if (username === community.manager_username) contributions += 1;

      return {
        ...profile!,
        contributions,
      };
    })
    .sort((a, b) => {
      if (a.username === community.manager_username) return -1;
      if (b.username === community.manager_username) return 1;

      return b.contributions - a.contributions;
    });
}

export async function getUserContributionStats(
  username: string
): Promise<UserContributionStats> {
  const [profile, communities, allPosts] = await Promise.all([
    getUserProfile(username),
    getRawCommunities(),
    getForumPosts(),
  ]);
  const communityCounts = new Map<string, number>();
  let userPosts = 0;
  let userComments = 0;
  let userReplies = 0;
  let acceptedAnswers = 0;
  let points = profile?.points || 0;

  for (const community of communities) {
    const posts = await getForumPosts(community.slug);

    for (const post of posts) {
      if (post.author === username) {
        userPosts += 1;
        points += post.upvotes;
        communityCounts.set(
          community.slug,
          (communityCounts.get(community.slug) || 0) + 1
        );
      }

      for (const comment of post.comments) {
        if (comment.author === username) {
          userComments += 1;
          points += comment.upvotes;
          acceptedAnswers += comment.accepted ? 1 : 0;
          communityCounts.set(
            community.slug,
            (communityCounts.get(community.slug) || 0) + 1
          );
        }

        for (const reply of comment.replies) {
          if (reply.author === username) {
            userReplies += 1;
            points += 2;
            communityCounts.set(
              community.slug,
              (communityCounts.get(community.slug) || 0) + 1
            );
          }
        }
      }
    }
  }

  return {
    posts: userPosts,
    comments: userComments,
    replies: userReplies,
    acceptedAnswers,
    points,
    communities: [...communityCounts.entries()]
      .map(([slug, contributions]) => {
        const community = communities.find((item) => item.slug === slug);

        return {
          slug,
          name: community?.name || slug,
          symbol: community?.symbol || "",
          contributions,
        };
      })
      .sort((a, b) => b.contributions - a.contributions),
  };
}

export async function getUserCollaborations(
  username: string
): Promise<Collaboration[]> {
  const communities = await getRawCommunities();
  const collaborations: Collaboration[] = [];

  for (const community of communities) {
    const posts = await getForumPosts(community.slug);

    for (const post of posts) {
      const comment = post.comments.find((item) => item.author === username);
      const reply = post.comments.find((item) =>
        item.replies.some((nestedReply) => nestedReply.author === username)
      );

      let action: Collaboration["action"] | null = null;
      let points = 0;

      if (post.author === username) {
        action = "asked";
        points = post.upvotes;
      } else if (comment) {
        action = "answered";
        points = comment.upvotes + (comment.accepted ? 10 : 0);
      } else if (reply) {
        action = "replied";
        points = 4;
      }

      if (!action) continue;

      const collaboratorUsernames = new Set<string>();

      collaboratorUsernames.add(post.author);
      for (const postComment of post.comments) {
        collaboratorUsernames.add(postComment.author);
        for (const nestedReply of postComment.replies) {
          collaboratorUsernames.add(nestedReply.author);
        }
      }
      collaboratorUsernames.delete(username);

      collaborations.push({
        id: `${community.slug}-${post.id}`,
        communitySlug: community.slug,
        communityName: community.name,
        communitySymbol: community.symbol,
        postId: post.id,
        postTitle: post.title,
        type: post.type,
        action,
        points,
        collaboratorUsernames: [...collaboratorUsernames],
        tags: post.tags,
        solved: post.solved,
      });
    }
  }

  return collaborations.sort((a, b) => b.points - a.points);
}

export type DashboardActivityItem = {
  id: string;
  userImage: string;
  userName: string;
  subject: string;
  points: number;
  type: "gave" | "received";
};

export async function getUserRecentActivities(
  username: string
): Promise<DashboardActivityItem[]> {
  const [communities, profiles] = await Promise.all([
    getRawCommunities(),
    getProfilesMap(),
  ]);

  const activities: DashboardActivityItem[] = [];

  for (const community of communities) {
    const posts = await getForumPosts(community.slug);

    for (const post of posts) {
      if (post.author === username) {
        for (const comment of post.comments) {
          if (comment.author !== username) {
            const helperProfile = profiles.get(comment.author);
            if (helperProfile) {
              activities.push({
                id: `rec-${post.id}-${comment.id}`,
                userImage: helperProfile.image,
                userName: helperProfile.name,
                subject: community.name,
                points: comment.upvotes + (comment.accepted ? 20 : 1),
                type: "received",
              });
            }
          }
        }
      } else {
        const myComment = post.comments.find(
          (c) => c.author === username
        );
        if (myComment) {
          const authorProfile = profiles.get(post.author);
          if (authorProfile) {
            activities.push({
              id: `gave-${post.id}-${myComment.id}`,
              userImage: authorProfile.image,
              userName: authorProfile.name,
              subject: community.name,
              points: myComment.upvotes + (myComment.accepted ? 20 : 1),
              type: "gave",
            });
          }
        }
      }
    }
  }

  const uniqueActivities: DashboardActivityItem[] = [];
  const seenKeys = new Set<string>();

  for (const act of activities) {
    const key = `${act.type}-${act.userName}-${act.subject}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueActivities.push(act);
    }
  }

  return uniqueActivities.slice(0, 3);
}

export type FriendshipStatus = "none" | "pending_sent" | "pending_received" | "accepted";

export async function getFriendshipStatus(
  userUsername: string,
  targetUsername: string
): Promise<FriendshipStatus> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !userUsername || !targetUsername) return "none";
  if (userUsername === targetUsername) return "none";

  const { data } = await supabase
    .from("friends")
    .select("user_username, friend_username, status")
    .or(
      `and(user_username.eq.${userUsername},friend_username.eq.${targetUsername}),and(user_username.eq.${targetUsername},friend_username.eq.${userUsername})`
    );

  if (!data || data.length === 0) return "none";

  const accepted = data.find((r) => r.status === "accepted");
  if (accepted) return "accepted";

  const sentByMe = data.find(
    (r) => r.user_username === userUsername && r.status === "pending"
  );
  if (sentByMe) return "pending_sent";

  const receivedByMe = data.find(
    (r) => r.friend_username === userUsername && r.status === "pending"
  );
  if (receivedByMe) return "pending_received";

  return "none";
}

export type FriendRequestItem = {
  id: string;
  senderUsername: string;
  senderName: string;
  senderImage: string;
  createdAt: string;
};

export async function getPendingFriendRequests(
  username: string
): Promise<FriendRequestItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !username) return [];

  const { data: rows } = await supabase
    .from("friends")
    .select("id, user_username, created_at")
    .eq("friend_username", username)
    .eq("status", "pending");

  if (!rows || rows.length === 0) return [];

  const profiles = await getProfilesMap();

  return rows
    .map((row) => {
      const sender = profiles.get(row.user_username);
      if (!sender) return null;
      return {
        id: row.id,
        senderUsername: sender.username,
        senderName: sender.name,
        senderImage: sender.image,
        createdAt: row.created_at,
      };
    })
    .filter(Boolean) as FriendRequestItem[];
}

export async function getUserFriends(username: string): Promise<Friend[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !username) return [];

  const { data: friendRows } = await supabase
    .from("friends")
    .select("friend_username")
    .eq("user_username", username)
    .eq("status", "accepted");

  if (!friendRows || friendRows.length === 0) return [];

  const friendUsernames = friendRows.map((r) => r.friend_username);
  const profiles = await getProfilesMap();

  return friendUsernames
    .map((fUsername) => profiles.get(fUsername))
    .filter(Boolean)
    .map((profile, index) => ({
      ...profile!,
      sharedCommunitySlugs: [],
      sharedCommunities: [],
      collaborations: 0,
      lastActive: index % 2 === 0 ? "Today" : "This week",
    }));
}

export type LeagueHighlight = {
  leagueId: string;
  leagueName: string;
  userScore: number;
  aheadOf: {
    username: string;
    displayName: string;
    diff: number;
  } | null;
  behind: {
    username: string;
    displayName: string;
    diff: number;
  } | null;
};

export async function getUserLeagueHighlight(username: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const profiles = await getProfilesMap();
  const userProfile = profiles.get(username);
  if (!userProfile) return null;

  const { data: userEntries } = await supabase
    .from("league_entries")
    .select("league_id")
    .eq("username", username);

  let leagueId = userEntries?.[0]?.league_id;

  const userPoints = userProfile.points;

  if (!leagueId) {
    if (userPoints >= 800) leagueId = "diamond";
    else if (userPoints >= 500) leagueId = "ruby";
    else if (userPoints >= 300) leagueId = "sapphire";
    else if (userPoints >= 150) leagueId = "gold";
    else if (userPoints >= 50) leagueId = "silver";
    else leagueId = "bronze";
  }

  const tierConfig: Record<string, { name: string; nextName: string; min: number; target: number }> = {
    bronze: { name: "Bronze", nextName: "Silver", min: 0, target: 50 },
    silver: { name: "Silver", nextName: "Gold", min: 50, target: 150 },
    gold: { name: "Gold", nextName: "Sapphire", min: 150, target: 300 },
    sapphire: { name: "Sapphire", nextName: "Ruby", min: 300, target: 500 },
    ruby: { name: "Ruby", nextName: "Diamond", min: 500, target: 800 },
    diamond: { name: "Diamond", nextName: "Legend", min: 800, target: 1200 },
  };

  const currentTier = tierConfig[leagueId] || tierConfig.gold;

  const pointsToNextTier = Math.max(0, currentTier.target - userPoints);
  const range = currentTier.target - currentTier.min;
  const progressPercent = range > 0
    ? Math.min(1, Math.max(0.05, (userPoints - currentTier.min) / range))
    : 0.9;

  const { data: rawEntries } = await supabase
    .from("league_entries")
    .select("username, display_name, score, league_id")
    .eq("league_id", leagueId);

  const allUserList = Array.from(profiles.values()).filter((p) => {
    let pLeague = (rawEntries || []).find((e: any) => e.username === p.username)?.league_id;
    if (!pLeague) {
      if (p.points >= 800) pLeague = "diamond";
      else if (p.points >= 500) pLeague = "ruby";
      else if (p.points >= 300) pLeague = "sapphire";
      else if (p.points >= 150) pLeague = "gold";
      else if (p.points >= 50) pLeague = "silver";
      else pLeague = "bronze";
    }
    return pLeague === leagueId;
  });

  const entries = allUserList
    .map((p) => ({
      username: p.username,
      display_name: p.name || p.username,
      score: p.points,
    }))
    .sort((a, b) => b.score - a.score);

  const index = entries.findIndex((entry) => entry.username === username);
  const userScore = userPoints;
  const ahead = index > 0 ? entries[index - 1] : null;
  const behind = index !== -1 && index < entries.length - 1 ? entries[index + 1] : null;

  return {
    leagueId,
    leagueName: currentTier.name,
    nextLeagueName: currentTier.nextName,
    pointsToNextTier,
    progressPercent,
    userScore,
    userRank: index !== -1 ? index + 1 : 1,
    aheadOf: behind
      ? {
          username: behind.username,
          displayName: behind.display_name,
          diff: Math.abs(userScore - behind.score),
        }
      : null,
    behind: ahead
      ? {
          username: ahead.username,
          displayName: ahead.display_name,
          diff: Math.abs(ahead.score - userScore),
        }
      : null,
  };
}

export async function getLeaguesData() {
  const supabase = await createSupabaseServerClient();

  const defaultLeagues: League[] = [
    {
      id: "bronze",
      tier: "Bronze",
      name: "Explorer League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#CD7F32",
      banner: "/testing/banner_test.png",
    },
    {
      id: "silver",
      tier: "Silver",
      name: "Collaborator League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#C0C0C0",
      banner: "/testing/banner_test.png",
    },
    {
      id: "gold",
      tier: "Gold",
      name: "Scholar League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#FFD700",
      banner: "/testing/banner_test.png",
    },
    {
      id: "sapphire",
      tier: "Sapphire",
      name: "Master League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#0F52BA",
      banner: "/testing/banner_test.png",
    },
    {
      id: "ruby",
      tier: "Ruby",
      name: "Champion League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#E0115F",
      banner: "/testing/banner_test.png",
    },
    {
      id: "diamond",
      tier: "Diamond",
      name: "Legend League",
      threshold: "Top 20% Promoted ⬆",
      accent: "#B9F2FF",
      banner: "/testing/banner_test.png",
    },
  ];

  if (!supabase) {
    return {
      currentLeagueId: "gold",
      season: {
        name: "Weekly League Season #14",
        endsIn: "3 days 14 hours",
        userProgressLabel: "Top 20% promote to next league",
      },
      leagues: defaultLeagues,
      leaderboards: {} as Record<string, LeaderboardEntry[]>,
    };
  }

  try {
    const [
      { data: dbLeagues },
      { data: dbEntries },
      { data: postsData },
      { data: commentsData },
      usersMap,
    ] = await Promise.all([
      supabase.from("leagues").select("*").order("sort_order"),
      supabase.from("league_entries").select("*"),
      supabase.from("posts").select("author_username"),
      supabase.from("comments").select("author_username, accepted"),
      getProfilesMap(),
    ]);

    // Calculate total collaborations per user (Posts + Comments + Accepted Solutions)
    const collabMap = new Map<string, number>();
    (postsData || []).forEach((p: any) => {
      if (p.author_username) {
        collabMap.set(p.author_username, (collabMap.get(p.author_username) || 0) + 1);
      }
    });
    (commentsData || []).forEach((c: any) => {
      if (c.author_username) {
        const addCount = c.accepted ? 2 : 1;
        collabMap.set(c.author_username, (collabMap.get(c.author_username) || 0) + addCount);
      }
    });

    const activeLeagues: League[] = (dbLeagues && dbLeagues.length > 0)
      ? (dbLeagues as DbLeague[]).map((l) => ({
          id: l.id,
          tier: l.tier,
          name: l.name,
          threshold: l.threshold || "Top 20% Promoted ⬆",
          accent: l.accent,
          banner: l.banner || "/testing/banner_test.png",
        }))
      : defaultLeagues;

    const leaderboards: Record<string, LeaderboardEntry[]> = {};
    activeLeagues.forEach((l) => {
      leaderboards[l.id] = [];
    });

    const allProfiles = Array.from(usersMap.values());

    allProfiles.forEach((profile) => {
      // Find matching entry or assign tier based on points
      const dbEntry = (dbEntries || []).find((e: any) => e.username === profile.username);
      let targetLeagueId = dbEntry?.league_id;

      if (!targetLeagueId || !leaderboards[targetLeagueId]) {
        // Dynamic assignment based on cumulative points
        if (profile.points >= 800) targetLeagueId = "diamond";
        else if (profile.points >= 500) targetLeagueId = "ruby";
        else if (profile.points >= 300) targetLeagueId = "sapphire";
        else if (profile.points >= 150) targetLeagueId = "gold";
        else if (profile.points >= 50) targetLeagueId = "silver";
        else targetLeagueId = "bronze";
      }

      const totalCollabs = collabMap.get(profile.username) || Math.max(1, Math.floor(profile.points / 3));

      leaderboards[targetLeagueId].push({
        username: profile.username,
        displayName: profile.name || profile.username,
        image: profile.image,
        score: profile.points,
        collaborations: totalCollabs,
      });
    });

    // Sort leaderboards and flag promotion/demotion zones
    for (const leagueId in leaderboards) {
      const list = leaderboards[leagueId];
      list.sort((a, b) => b.score - a.score);

      const totalCount = list.length;
      const promoCutoff = Math.max(1, Math.ceil(totalCount * 0.2));
      const demoCutoff = Math.floor(totalCount * 0.8);

      list.forEach((entry, idx) => {
        // Highest tier (diamond) has no promotion; lowest tier (bronze) has no demotion
        entry.isPromotionZone = leagueId !== "diamond" && idx < promoCutoff;
        entry.isDemotionZone = leagueId !== "bronze" && idx >= demoCutoff && totalCount >= 3;
      });
    }

    return {
      currentLeagueId: "gold",
      season: {
        name: "Weekly League Season #14",
        endsIn: "3 days 14 hours",
        userProgressLabel: "Top 20% promote to next league • Bottom 20% demote",
      },
      leagues: activeLeagues,
      leaderboards,
    };
  } catch (err: any) {
    console.warn("Error fetching leagues data, returning defaults:", err?.message);
    return {
      currentLeagueId: "gold",
      season: {
        name: "Weekly League Season #14",
        endsIn: "3 days 14 hours",
        userProgressLabel: "Top 20% promote to next league",
      },
      leagues: defaultLeagues,
      leaderboards: {} as Record<string, LeaderboardEntry[]>,
    };
  }
}
