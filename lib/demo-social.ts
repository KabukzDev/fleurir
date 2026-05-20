import communitiesData from "@/data/communities.json";
import postsData from "@/data/posts.json";
import usersData from "@/data/users.json";

export type UserProfile = {
  image: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  points: number;
  joinedAt: string;
  interests: string[];
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
  username: string;
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

type PostComment = {
  author: string;
  upvotes?: number;
  accepted?: boolean;
  replies?: { author: string }[];
};

const users = usersData as Record<string, UserProfile>;
const communities = communitiesData as Record<
  string,
  {
    symbol: string;
    name: string;
    banner: string;
    manager: string;
    members: { total: number; online: number };
    profile?: { points: number; contributions: number };
  }
>;

export function getUserProfile(username: string) {
  return users[username];
}

export function getAllUsers() {
  return users;
}

export function getAllCommunities() {
  return communities;
}

export function getUserContributionStats(username: string): UserContributionStats {
  const communityCounts = new Map<string, number>();
  let userPosts = 0;
  let userComments = 0;
  let userReplies = 0;
  let acceptedAnswers = 0;
  let points = users[username]?.points || 0;

  for (const [communitySlug, posts] of Object.entries(postsData.communities)) {
    for (const post of posts) {
      if (post.author === username) {
        userPosts += 1;
        points += post.upvotes;
        communityCounts.set(
          communitySlug,
          (communityCounts.get(communitySlug) || 0) + 1
        );
      }

      for (const comment of (post.comments || []) as PostComment[]) {
        if (comment.author === username) {
          userComments += 1;
          points += comment.upvotes || 0;
          acceptedAnswers += comment.accepted ? 1 : 0;
          communityCounts.set(
            communitySlug,
            (communityCounts.get(communitySlug) || 0) + 1
          );
        }

        for (const reply of comment.replies || []) {
          if (reply.author === username) {
            userReplies += 1;
            points += 2;
            communityCounts.set(
              communitySlug,
              (communityCounts.get(communitySlug) || 0) + 1
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
      .map(([slug, contributions]) => ({
        slug,
        name: communities[slug].name,
        symbol: communities[slug].symbol,
        contributions,
      }))
      .sort((a, b) => b.contributions - a.contributions),
  };
}

export function getAnnaCollaborations(): Collaboration[] {
  const collaborations: Collaboration[] = [];

  for (const [communitySlug, posts] of Object.entries(postsData.communities)) {
    const community = communities[communitySlug];

    for (const post of posts) {
      const comments = (post.comments || []) as PostComment[];
      const annaComment = comments.find((comment) => comment.author === "anna");
      const annaReply = comments.find((comment) =>
        (comment.replies || []).some((reply) => reply.author === "anna")
      );

      let action: Collaboration["action"] | null = null;
      let points = 0;

      if (post.author === "anna") {
        action = "asked";
        points = post.upvotes;
      } else if (annaComment) {
        action = "answered";
        points = (annaComment.upvotes || 0) + (annaComment.accepted ? 10 : 0);
      } else if (annaReply) {
        action = "replied";
        points = 4;
      }

      if (!action) continue;

      const collaboratorUsernames = new Set<string>();

      collaboratorUsernames.add(post.author);
      for (const comment of comments) {
        collaboratorUsernames.add(comment.author);
        for (const reply of comment.replies || []) {
          collaboratorUsernames.add(reply.author);
        }
      }
      collaboratorUsernames.delete("anna");

      collaborations.push({
        id: `${communitySlug}-${post.id}`,
        communitySlug,
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

export function getAnnaFriends(): Friend[] {
  const collaborations = getAnnaCollaborations();
  const friendMap = new Map<
    string,
    {
      sharedCommunitySlugs: Set<string>;
      collaborations: number;
    }
  >();

  for (const collaboration of collaborations) {
    for (const username of collaboration.collaboratorUsernames) {
      if (!users[username]) continue;

      const friend = friendMap.get(username) || {
        sharedCommunitySlugs: new Set<string>(),
        collaborations: 0,
      };

      friend.sharedCommunitySlugs.add(collaboration.communitySlug);
      friend.collaborations += 1;
      friendMap.set(username, friend);
    }
  }

  return [...friendMap.entries()]
    .map(([username, data], index) => {
      const sharedCommunitySlugs = [...data.sharedCommunitySlugs];

      return {
        ...users[username],
        username,
        sharedCommunitySlugs,
        sharedCommunities: sharedCommunitySlugs.map(
          (slug) => communities[slug].name
        ),
        collaborations: data.collaborations,
        lastActive: index % 2 === 0 ? "Today" : "This week",
      };
    })
    .sort((a, b) => b.collaborations - a.collaborations);
}
