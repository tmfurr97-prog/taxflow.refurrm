import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CheckCircle, Star, TrendingUp, Shield, Bot, Receipt,
  DollarSign, Building2, Bitcoin, FileText, Users, BookOpen,
  Zap, Clock, Award, Sparkles, ChevronRight, Lock, Phone,
  Mail, Twitter, Linkedin, Menu, X, CalendarDays
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Academy", href: "/academy" },
];

const FEATURES = [
  { icon: Bot, title: "TaxGPT AI", desc: "24/7 AI tax assistant — ask anything, get instant answers backed by current tax law.", tier: "Essential+", color: "text-emerald-400" },
  { icon: Receipt, title: "Receipt & Mileage Tracking", desc: "Snap receipts, auto-categorize expenses, and track business miles year-round.", tier: "Free", color: "text-blue-400" },
  { icon: DollarSign, title: "Quarterly Tax Estimates", desc: "Never miss a quarterly deadline. Auto-calculate what you owe and when.", tier: "Free", color: "text-green-400" },
  { icon: Bitcoin, title: "Crypto Tax Tracking", desc: "Import from any exchange, calculate gains/losses, and generate Form 8949.", tier: "Pro+", color: "text-yellow-400" },
  { icon: Shield, title: "Audit Defense Hub", desc: "IRS correspondence tracking, audit trail, and professional support when you need it.", tier: "Pro+", color: "text-red-400" },
  { icon: Building2, title: "Business Entity Management", desc: "Manage LLCs, S-Corps, and multi-entity compliance from one dashboard.", tier: "Pro+", color: "text-purple-400" },
  { icon: Users, title: "Remote Returns", desc: "Upload your docs and let a real human preparer handle everything — filed through our licensed e-file partner.", tier: "A la carte", color: "text-teal-400" },
  { icon: BookOpen, title: "SmartBooks Academy", desc: "Tax education courses, guides, and resources to make you financially literate.", tier: "Essential+", color: "text-orange-400" },
];

const TESTIMONIALS = [
  {
    name: "Jessica Martinez",
    role: "Independent Consultant",
    content: "TaxFlow helped me organize a year of chaotic receipts in just one afternoon. Game changer for my business.",
    rating: 5,
    avatar: "JM",
  },
  {
    name: "David Park",
    role: "E-commerce Seller",
    content: "The automated expense tracking alone is worth it. I found deductions I did not even know existed.",
    rating: 5,
    avatar: "DP",
  },
  {
    name: "Amanda Foster",
    role: "Creative Agency Owner",
    content: "Finally ditched my expensive accountant. TaxFlow gives me the same results at a fraction of the cost.",
    rating: 5,
    avatar: "AF",
  },
];

const STATS = [
  { value: "250K+", label: "Happy Users" },
  { value: "5M+", label: "Deductions Found" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "99.8%", label: "Filing Success" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up free", desc: "Create your account in 30 seconds. No credit card required." },
  { step: "02", title: "Connect and upload", desc: "Link accounts or upload documents. Our AI categorizes everything automatically." },
  { step: "03", title: "Track year-round", desc: "Receipts, mileage, quarterly estimates — all in one place, all year long." },
  { step: "04", title: "File with confidence", desc: "Use TaxGPT, prep your own return, or hand it to our human preparers." },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) setLocation("/dashboard");
    else window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-lg leading-none">TaxFlow</span>
                  <span className="text-emerald-400 text-xs block leading-none">SmartBooks24</span>
                </div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}>
                  <span className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">{link.label}</span>
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button onClick={() => setLocation("/dashboard")} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setLocation("/login")} className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-3">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <div className="text-slate-300 hover:text-white py-2 text-sm cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </div>
              </Link>
            ))}
            <Button onClick={handleGetStarted} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-2">
              Get Started Free
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Year-Round Tax Automation</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Automate.<br />
                Simplify.<br />
                <span className="text-emerald-400">File with confidence.</span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Your year-round tax assistant. Store receipts, track expenses, and stay audit-ready automatically — no manual entry, no stress, no surprise bills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" onClick={handleGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 h-14 font-semibold gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Button>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent text-lg px-8 h-14 gap-2 w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
                <a href="https://calendly.com/refurrm-llc/30min" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-emerald-700 text-emerald-400 hover:bg-emerald-950 bg-transparent text-lg px-8 h-14 gap-2 w-full">
                    <CalendarDays className="w-5 h-5" /> Book a Free Consultation
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free plan forever</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-slate-600 text-xs ml-2">TaxFlow Dashboard</span>
                </div>
                <img src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762416634673_ecd9eff4.webp" alt="TaxFlow Dashboard Preview" className="w-full rounded-lg" />
              </div>
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">4.9 Rating</div>
              <div className="absolute -bottom-4 -left-4 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
                <span className="text-emerald-400 font-bold">5M+</span> deductions found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl lg:text-4xl font-bold text-emerald-400">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">Everything You Need</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">One platform. Every tax need.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">From daily expense tracking to full human-prepared returns — TaxFlow covers the entire tax lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <feature.icon className={"w-6 h-6 " + feature.color} />
                  <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">{feature.tier}</Badge>
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4">Simple Process</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Your Tax Journey, Simplified</h2>
            <p className="text-xl text-slate-400">Four steps to stress-free filing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-emerald-400 font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 mb-4">Real Stories</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">People love TaxFlow</h2>
            <p className="text-xl text-slate-400">Join thousands who have simplified their tax lives</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-24 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 rounded-2xl p-10 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl">
                      👩🏽‍💼
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Teresa</p>
                      <p className="text-emerald-400 text-sm">Founder, SmartBooks24</p>
                      <p className="text-slate-500 text-xs mt-0.5">PTIN Holder · CPA Candidate · Tax Enthusiast since 1997</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                      <p className="text-2xl font-bold text-emerald-400">1997</p>
                      <p className="text-slate-400 text-xs mt-1">Fell in love with taxes</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                      <p className="text-2xl font-bold text-emerald-400">Harley</p>
                      <p className="text-slate-400 text-xs mt-1">The reason this exists</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                      <p className="text-2xl font-bold text-emerald-400">Now</p>
                      <p className="text-slate-400 text-xs mt-1">Built for you</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["W-2 & 1099", "Gig Workers", "Self-Employed", "Small Business", "Crypto", "Side Hustles"].map(tag => (
                      <span key={tag} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Story */}
            <div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-6">Built by a Real Preparer</Badge>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                A lifelong obsession.<br />
                <span className="text-emerald-400">Finally turned into something.</span>
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  I&rsquo;ve been fascinated by taxes since 1997. Not because it&rsquo;s glamorous — it&rsquo;s not — but because I watched people around me overpay, miss deductions, and get blindsided by bills that were completely avoidable. I just knew there was a better way.
                </p>
                <p>
                  For years I helped family and friends for free. Then my daughter Harley went off to college, and suddenly I had way too much time on my hands and no more excuses. So I got serious. Got my PTIN. Started studying for my CPA. And built the tool I always wished existed.
                </p>
                <p>
                  SmartBooks24 is what happens when someone who genuinely loves this stuff stops doing it for free and starts doing it right — with AI that works year-round and a real human who actually knows your situation.
                </p>
                <p className="text-emerald-400 font-medium">
                  When you work with SmartBooks24, you get someone who genuinely cares — not just about your refund, but about your financial future.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/remote-returns">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-11 px-6">
                    File with Teresa <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 h-11 px-6 bg-transparent">
                    See All Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">Simple Pricing</Badge>
          <h2 className="text-4xl font-bold text-white mb-4">Start free. Upgrade when you are ready.</h2>
          <p className="text-xl text-slate-400 mb-12">Plans from $0 to $39.99/month. No contracts, no hidden fees, cancel anytime.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { name: "Free", price: "$0", desc: "Receipts, mileage, 1 estimate", highlight: false },
              { name: "Essential", price: "$9.99", desc: "Unlimited tracking + TaxGPT", highlight: false },
              { name: "Pro", price: "$24.99", desc: "Full suite: crypto, audit, entities", highlight: true },
              { name: "Business", price: "$39.99", desc: "Multi-entity + priority support", highlight: false },
            ].map((plan, i) => (
              <div key={i} className={"p-5 rounded-xl border text-left " + (plan.highlight ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-900 border-slate-800")}>
                {plan.highlight && <Badge className="bg-emerald-500 text-white border-0 text-xs mb-2">Most Popular</Badge>}
                <p className="text-white font-bold text-lg">{plan.name}</p>
                <p className="text-emerald-400 font-bold text-2xl my-1">{plan.price}<span className="text-slate-500 text-sm font-normal">/mo</span></p>
                <p className="text-slate-500 text-xs">{plan.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/pricing">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-12 px-8">
              See Full Pricing <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Transform your tax experience today</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of professionals who have automated their tax workflow. Start free — no credit card needed.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 h-14 font-semibold gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent text-lg px-10 h-14 gap-2 w-full sm:w-auto">
                View Plans
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center mt-8 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> Free plan forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold leading-none">TaxFlow</p>
                  <p className="text-emerald-400 text-xs">SmartBooks24 by ReFurrm</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">Year-round tax automation for freelancers, gig workers, and small businesses.</p>
              <a href="mailto:support@taxflow.refurrm.com" className="text-slate-500 hover:text-emerald-400 text-sm flex items-center gap-1.5 transition-colors">
                <Mail className="w-3.5 h-3.5" /> support@taxflow.refurrm.com
              </a>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/pricing"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Pricing</span></Link></li>
                <li><Link href="/features"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Features</span></Link></li>
                <li><Link href="/blog"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Blog</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">SmartBooks Academy</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/academy"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Courses</span></Link></li>
                <li><a href="https://taxflow.refurrm.com" className="hover:text-emerald-400 transition-colors">Learning Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/privacy"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span></Link></li>
                <li><Link href="/terms"><span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span></Link></li>
              </ul>
              <div className="mt-6">
                <p className="text-slate-600 text-xs leading-relaxed">Returns prepared by SmartBooks24 (PTIN on file). E-filing through licensed partner.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              {"© "}{new Date().getFullYear()}{" TaxFlow by SmartBooks24 · ReFurrm LLC. All rights reserved."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-600 hover:text-emerald-400 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="text-slate-600 hover:text-emerald-400 transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
