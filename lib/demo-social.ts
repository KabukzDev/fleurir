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

function memberUsernamesForCommunity(community: DbCommunity, posts: ForumPost[]) {
  const usernames = new Set<string>([community.manager_username]);

  for (const post of posts) {
    usernames.add(post.author);
    for (const comment of post.comments) {
      usernames.add(comment.author);
      for (const reply of comment.replies) {
        usernames.add(reply.author);
      }
    }
  }

  return usernames;
}

export async function getAllCommunities() {
  const [communities, allPosts, profiles] = await Promise.all([
    getRawCommunities(),
    getForumPosts(),
    getProfilesMap(),
  ]);

  return communities.map((community) => {
    const communityPosts = allPosts.filter(
      (post) => post.communitySlug === community.slug
    );
    const usernames = memberUsernamesForCommunity(
      community,
      communityPosts
    );
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
  const [community, posts, profiles] = await Promise.all([
    getRawCommunities().then((items) =>
      items.find((item) => item.slug === slug)
    ),
    getForumPosts(slug),
    getProfilesMap(),
  ]);

  if (!community) return [];

  const usernames = memberUsernamesForCommunity(community, posts);

  return [...usernames]
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

export async function getAnnaCollaborations(): Promise<Collaboration[]> {
  return getUserCollaborations("anna");
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

export async function getAnnaFriends(): Promise<Friend[]> {
  const collaborations = await getAnnaCollaborations();
  const profiles = await getProfilesMap();
  const friendMap = new Map<
    string,
    {
      sharedCommunitySlugs: Set<string>;
      collaborations: number;
    }
  >();

  for (const collaboration of collaborations) {
    for (const username of collaboration.collaboratorUsernames) {
      if (!profiles.has(username)) continue;

      const friend = friendMap.get(username) || {
        sharedCommunitySlugs: new Set<string>(),
        collaborations: 0,
      };

      friend.sharedCommunitySlugs.add(collaboration.communitySlug);
      friend.collaborations += 1;
      friendMap.set(username, friend);
    }
  }

  const communities = await getRawCommunities();

  return [...friendMap.entries()]
    .map(([username, data], index) => {
      const profile = profiles.get(username)!;
      const sharedCommunitySlugs = [...data.sharedCommunitySlugs];

      return {
        ...profile,
        sharedCommunitySlugs,
        sharedCommunities: sharedCommunitySlugs.map(
          (slug) => communities.find((community) => community.slug === slug)?.name || slug
        ),
        collaborations: data.collaborations,
        lastActive: index % 2 === 0 ? "Today" : "This week",
      };
    })
    .sort((a, b) => b.collaborations - a.collaborations);
}

export async function getLeaguesData() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      currentLeagueId: "gold-freud",
      season: {
        name: "Seasonal Leagues",
        endsIn: "12 days",
        userProgressLabel: "257 points away from Einstein's League",
      },
      leagues: [] as League[],
      leaderboards: {} as Record<string, LeaderboardEntry[]>,
    };
  }

  const [{ data: leagues, error: leaguesError }, { data: entries, error: entriesError }, users] =
    await Promise.all([
      supabase.from("leagues").select("*").order("sort_order"),
      supabase.from("league_entries").select("*").order("score", { ascending: false }),
      getProfilesMap(),
    ]);

  if (leaguesError) throw leaguesError;
  if (entriesError) throw entriesError;

  const normalizedLeagues = ((leagues || []) as DbLeague[]).map((league) => ({
    id: league.id,
    tier: league.tier,
    name: league.name,
    threshold: league.threshold,
    accent: league.accent,
    banner: league.banner,
  }));
  const leaderboards: Record<string, LeaderboardEntry[]> = {};

  for (const entry of (entries || []) as DbLeagueEntry[]) {
    const profile = users.get(entry.username);
    const list = leaderboards[entry.league_id] || [];

    list.push({
      username: entry.username,
      displayName: entry.display_name,
      image: profile?.image,
      score: entry.score,
      collaborations: entry.collaborations,
    });
    leaderboards[entry.league_id] = list;
  }

  return {
    currentLeagueId: "gold-freud",
    season: {
      name: "Seasonal Leagues",
      endsIn: "12 days",
      userProgressLabel: "257 points away from Einstein's League",
    },
    leagues: normalizedLeagues,
    leaderboards,
  };
}
