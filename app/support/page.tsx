"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const categories = [
    {
      id: "account",
      icon: "person",
      title: "Account & Settings",
      description: "Manage your profile, avatar, password, and preferences.",
    },
    {
      id: "communities",
      icon: "forum",
      title: "Communities & Forums",
      description: "Join open communities, start threads, and upload comment attachments.",
    },
    {
      id: "leagues",
      icon: "emoji_events",
      title: "Leagues & Points",
      description: "Understand point rewards, answer acceptance, and league rankings.",
    },
    {
      id: "friends",
      icon: "group",
      title: "Friends & Social",
      description: "Add friends, manage connections, and track community collaborations.",
    },
    {
      id: "roles",
      icon: "verified_user",
      title: "Roles & Permissions",
      description: "Learn about Member, Mentor, and Administrator privileges.",
    },
    {
      id: "tech",
      icon: "handyman",
      title: "Technical Issues",
      description: "Troubleshoot real-time notifications, page updates, and connection issues.",
    },
  ];

  const faqs = [
    {
      q: "How do I earn points on Fleurir?",
      a: "You earn points when another user upvotes your post (+1 point) or comment (+1 point), when a mentor or post author marks your answer as accepted (+15 points), or when your post is marked as solved (+15 points).",
    },
    {
      q: "How do community memberships work?",
      a: "By default, new accounts start in zero communities. You can browse open communities and click 'Join Community' to join any space you want to participate in.",
    },
    {
      q: "How do I add or remove friends?",
      a: "Visit any user's profile page or search for members in Discover. Click '+ Add Friend' to add them to your friends list. You can manage or remove friends anytime from your Friends page.",
    },
    {
      q: "Can I delete my posts and comments?",
      a: "Yes! Members can delete their own posts and comments. Administrators have permission to delete any post or comment to keep discussions safe and helpful.",
    },
    {
      q: "How do comment attachments work?",
      a: "When posting a reply on any forum post, click '📎 Upload File/Image' to attach a local picture or paste an image URL. Attachments are saved directly to the database and rendered on your comment.",
    },
    {
      q: "What privileges do Mentors and Administrators have?",
      a: "Mentors can mark answers as accepted and posts as solved. Administrators can do all Mentor actions plus manage and delete any post or comment in the platform.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      !searchQuery ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;
    setFormSubmitted(true);
  };

  return (
    <main className="min-h-screen text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Banner */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 bg-flower-blue/20 text-flower-blue rounded-full text-sm font-medium border border-flower-blue/30">
            Fleurir Support Center
          </span>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            How can we help you?
          </h1>
          <p className="text-white/60 text-lg">
            Search our help articles, explore FAQs, or submit a request to our community team.
          </p>

          <div className="relative max-w-xl mx-auto mt-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, topics, or FAQs..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white outline-none focus:border-flower-blue transition placeholder:text-white/30"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 icon icon-rounded">
              search
            </span>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white/5 border border-white/5 hover:border-white/15 rounded-3xl p-6 transition duration-200 hover:scale-[1.01]"
            >
              <div className="w-12 h-12 rounded-2xl bg-flower-blue/15 border border-flower-blue/20 flex items-center justify-center text-flower-blue mb-4">
                <span className="icon icon-rounded">{cat.icon}</span>
              </div>
              <h3 className="text-xl font-medium mb-2">{cat.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-light">Frequently Asked Questions</h2>
              <p className="text-white/50 text-sm mt-1">Quick answers to common Fleurir questions.</p>
            </div>
            <span className="text-white/40 text-sm">{filteredFaqs.length} questions</span>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-white/5 transition"
                >
                  <span className="font-medium text-lg">{faq.q}</span>
                  <span className="text-white/40 font-bold text-xl">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-5 text-white/70 leading-relaxed text-sm border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <p className="text-white/40 text-center py-6">No matching FAQs found for &quot;{searchQuery}&quot;.</p>
            )}
          </div>
        </section>

        {/* Support Request Form */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-light">Submit a Request</h2>
            <p className="text-white/50 text-sm mt-1">
              Need assistance? Send a message to our support team and we will get back to you soon.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-2xl p-6 text-center space-y-3">
              <span className="text-3xl">✓</span>
              <h3 className="text-xl font-medium">Ticket Submitted Successfully!</h3>
              <p className="text-sm opacity-80 max-w-md mx-auto">
                Thank you for reaching out. We have received your request and will follow up shortly.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setTicketData({ name: "", email: "", category: "general", subject: "", message: "" });
                }}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={ticketData.name}
                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-flower-blue transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={ticketData.email}
                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-flower-blue transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Topic Category</label>
                <select
                  value={ticketData.category}
                  onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                  className="w-full bg-[#1b1e22] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-flower-blue transition text-sm"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account & Profile</option>
                  <option value="points">Leagues & Points</option>
                  <option value="technical">Technical Issue</option>
                  <option value="moderation">Feedback & Moderation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  placeholder="Summary of your question or issue"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-flower-blue transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  placeholder="Provide details about your request..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-flower-blue transition text-sm resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-flower-blue hover:bg-flower-blue/90 text-white px-6 py-2.5 rounded-xl font-medium transition cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Return link */}
        <div className="text-center">
          <Link href="/dashboard" className="text-white/40 hover:text-white text-sm transition">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
