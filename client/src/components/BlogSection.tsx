import React, { useState } from 'react';

const BLOG_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951602714_072e4bd3.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951600651_0fd35a64.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951602870_cc0e0f1e.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951605181_f0ca4b19.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951606818_964b79fc.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951612865_a0241d00.jpg',
];

const categories = ['All', 'Entrepreneurs', 'W2 Workers', 'Back Taxes', 'Bookkeeping', 'Tax Insights'];
const articles = [
  { title: '7 Tax Deductions Every Entrepreneur Misses', category: 'Entrepreneurs', readTime: '5 min', date: 'Feb 20, 2026', excerpt: 'Stop leaving money on the table. These overlooked deductions could save you thousands every year.' },
  { title: 'The W2 Worker\'s Guide to Maximizing Refunds', category: 'W2 Workers', readTime: '4 min', date: 'Feb 18, 2026', excerpt: 'Think W2 workers can\'t optimize? Think again. Here\'s how to maximize every dollar from your return.' },
  { title: 'IRS Sent You a Letter? Don\'t Panic — Do This', category: 'Back Taxes', readTime: '6 min', date: 'Feb 15, 2026', excerpt: 'Getting mail from the IRS is concerning. But with the right approach, most issues resolve quickly.' },
  { title: 'Bookkeeping Secrets That Save 6-Figure Businesses', category: 'Bookkeeping', readTime: '7 min', date: 'Feb 12, 2026', excerpt: 'The difference between surviving and thriving? Clean books. Here are the secrets top businesses use.' },
  { title: 'How to Use the Home Office Deduction in 2026', category: 'Tax Insights', readTime: '4 min', date: 'Feb 10, 2026', excerpt: 'Remote work changed everything. Make sure you\'re claiming every square foot you deserve.' },
  { title: 'LLC vs S-Corp: Which Saves More on Taxes?', category: 'Entrepreneurs', readTime: '8 min', date: 'Feb 8, 2026', excerpt: 'The entity structure debate, settled. We break down the real tax savings with actual numbers.' },
  { title: 'Back Taxes: The Complete Resolution Playbook', category: 'Back Taxes', readTime: '10 min', date: 'Feb 5, 2026', excerpt: 'Owe the IRS? Here\'s every option available to you, from installment plans to Offer in Compromise.' },
  { title: 'Quarterly Estimated Taxes: The Freelancer\'s Guide', category: 'Entrepreneurs', readTime: '5 min', date: 'Feb 3, 2026', excerpt: 'Avoid penalties and surprises. Master quarterly payments with this step-by-step breakdown.' },
  { title: '5 Receipt Tracking Apps That Actually Work', category: 'Bookkeeping', readTime: '3 min', date: 'Feb 1, 2026', excerpt: 'Shoebox full of receipts? There\'s a better way. These apps integrate directly with our platform.' },
  { title: 'The Complete Guide to Charitable Deductions', category: 'Tax Insights', readTime: '5 min', date: 'Jan 28, 2026', excerpt: 'Give back and get back. Maximize your charitable contributions for maximum tax benefit.' },
  { title: 'Side Hustle Taxes: What You Need to Know', category: 'W2 Workers', readTime: '6 min', date: 'Jan 25, 2026', excerpt: 'Driving Uber? Selling on Etsy? Here\'s how to handle taxes on your side income like a pro.' },
  { title: 'Year-End Tax Planning: The 30-Day Checklist', category: 'Tax Insights', readTime: '7 min', date: 'Jan 22, 2026', excerpt: 'December is your last chance to reduce this year\'s tax bill. Follow this checklist to the letter.' },
];

const BlogSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory);
  const visible = filtered.slice(0, visibleCount);

  return (
    <section id="blog" className="py-24 lg:py-32 bg-[#F7F9FA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#18453B] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">Resource Center</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">EXPERT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">TAX INSIGHTS</span></h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto text-lg">Expert insights, actionable strategies, and bookkeeping guidance for entrepreneurs, W2 workers, and everyone in between.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat ? 'bg-[#18453B] text-white shadow-sm' : 'bg-white text-[#6B7280] hover:text-[#0A1628] border border-gray-200 hover:border-gray-300'}`}>{cat}</button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((article, idx) => (
            <article key={idx} onClick={() => setSelectedArticle(selectedArticle === idx ? null : idx)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-44 overflow-hidden">
                <img src={BLOG_IMAGES[idx % BLOG_IMAGES.length]} alt={article.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#18453B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">{article.category}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-[#9CA3AF] text-xs mb-3"><span>{article.date}</span><span className="w-1 h-1 rounded-full bg-gray-300" /><span>{article.readTime} read</span></div>
                <h3 className="text-[#0A1628] font-bold text-base mb-2 group-hover:text-[#18453B] transition-colors leading-snug">{article.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{article.excerpt}</p>
                {selectedArticle === idx && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[#6B7280] text-sm leading-relaxed mb-3">This is a preview of the full article. Our tax experts break down everything you need to know with actionable steps and real-world examples.</p>
                    <button onClick={(e) => e.stopPropagation()} className="text-[#18453B] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">Read Full Article<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="text-center mt-10"><button onClick={() => setVisibleCount(prev => prev + 6)} className="border border-gray-200 hover:border-gray-300 text-[#0A1628] hover:bg-white font-semibold px-8 py-3 rounded-xl text-sm uppercase tracking-wider transition-all">Load More Articles</button></div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
