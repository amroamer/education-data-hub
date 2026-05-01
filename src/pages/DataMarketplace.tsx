import {
  Search, Filter, Download, Eye, Star, ArrowUpRight,
  Users, Calendar, Lock, Globe, FileText, ChevronRight,
  Sparkles, TrendingUp, ShieldCheck, Clock, Bookmark,
  Plus, CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";

const categories = ["All", "Enrollment", "Performance", "Staffing", "Infrastructure", "Finance", "Wellbeing"];

const datasets = [
  {
    id: 1, title: "Dubai Private School Enrollment 2024-25", provider: "KHDA", providerBadge: "Official",
    category: "Enrollment", records: "186K", updated: "Jan 2025", access: "open",
    description: "Comprehensive enrollment data across all Dubai private schools. Grade-level, nationality, gender, and curriculum breakdown.",
    rating: 4.9, reviews: 284, downloads: "12.4K", tags: ["K-12", "Private Schools", "Annual"], trending: true,
  },
  {
    id: 2, title: "DSIB Inspection Outcomes — 5yr Trend", provider: "KHDA Inspections", providerBadge: "Official",
    category: "Performance", records: "1,200", updated: "Mar 2025", access: "restricted",
    description: "Dubai School Inspection Bureau ratings, trends, and performance standards across all inspected schools.",
    rating: 4.7, reviews: 156, downloads: "8.1K", tags: ["DSIB", "Ratings", "Outcomes"], trending: false,
  },
  {
    id: 3, title: "Teacher Qualification Registry T2 2024-25", provider: "KHDA Licensing", providerBadge: "Verified",
    category: "Staffing", records: "24,800", updated: "Feb 2025", access: "open",
    description: "Active teaching staff qualifications, certifications, and professional development hours per Dubai school.",
    rating: 4.5, reviews: 98, downloads: "6.8K", tags: ["Teachers", "Qualifications", "Termly"], trending: false,
  },
  {
    id: 4, title: "School Infrastructure & Safety Assessment", provider: "Dubai Municipality", providerBadge: "Official",
    category: "Infrastructure", records: "2,430", updated: "Dec 2024", access: "open",
    description: "Physical infrastructure ratings, capacity, fire safety, and accessibility compliance for Dubai private schools.",
    rating: 4.3, reviews: 72, downloads: "4.2K", tags: ["Facilities", "Compliance", "Annual"], trending: false,
  },
  {
    id: 5, title: "Student Wellbeing Survey 2024", provider: "KHDA", providerBadge: "Official",
    category: "Wellbeing", records: "98K", updated: "Jan 2025", access: "restricted",
    description: "Student happiness, safety, and wellbeing survey results across Dubai private schools by grade and curriculum.",
    rating: 4.8, reviews: 203, downloads: "9.1K", tags: ["Wellbeing", "Survey", "Annual"], trending: true,
  },
  {
    id: 6, title: "Student Performance Benchmark 2024", provider: "KHDA Assessment", providerBadge: "Official",
    category: "Performance", records: "142K", updated: "Mar 2025", access: "restricted",
    description: "MAP, PISA-aligned, and national assessment scores with performance distributions and school benchmarks.",
    rating: 4.9, reviews: 341, downloads: "15.2K", tags: ["Assessment", "Benchmarks", "National"], trending: true,
  },
];

const badgeStyles: Record<string, { bg: string; color: string }> = {
  Official: { bg: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)" },
  Verified: { bg: "hsl(152 55% 92%)", color: "hsl(152 69% 31%)" },
};

const DataMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const { isRegulator } = useRole();

  const filtered = datasets.filter(d =>
    (activeCategory === "All" || d.category === activeCategory) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.provider.toLowerCase().includes(search.toLowerCase()))
  );

  const trending = datasets.filter(d => d.trending);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            {isRegulator ? "Data Catalog" : "Browse Datasets"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRegulator
              ? "Publish, manage, and monitor all KHDA education datasets"
              : "Discover and request education datasets published by KHDA"}
          </p>
        </div>
        {isRegulator && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> Publish Dataset
          </button>
        )}
      </div>

      {/* Trending strip */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(214 67% 14%) 0%, hsl(340 56% 30%) 100%)" }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(340 56% 65%)" }} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Trending this term</span>
        </div>
        <div className="flex gap-3 px-5 py-3 overflow-x-auto">
          {trending.map(ds => (
            <div key={ds.id} className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10">
              <div>
                <div className="text-white text-xs font-semibold leading-tight max-w-[160px] truncate">{ds.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/50 text-[10px]">{ds.provider}</span>
                  <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "hsl(340 56% 65%)" }}>
                    <Star className="w-2.5 h-2.5" style={{ fill: "hsl(340 56% 65%)" }} /> {ds.rating}
                  </span>
                  <span className="text-white/40 text-[10px]">{ds.downloads} dl</span>
                </div>
              </div>
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(340 56% 65%)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${filtered.length} datasets by name, provider, or topic…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2.5 border border-border bg-card rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-muted-foreground self-center ml-1">{filtered.length} results</span>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(ds => {
          const isSaved = saved.has(ds.id);
          const badge = badgeStyles[ds.providerBadge];
          return (
            <div key={ds.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "hsl(236 25% 92%)", color: "hsl(214 18% 40%)" }}>
                    {ds.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                    <ShieldCheck className="w-2.5 h-2.5" /> {ds.providerBadge}
                  </span>
                  {ds.trending && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)" }}>
                      <TrendingUp className="w-2.5 h-2.5" /> Trending
                    </span>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setSaved(s => { const n = new Set(s); isSaved ? n.delete(ds.id) : n.add(ds.id); return n; }); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "text-accent" : "text-muted-foreground"}`} style={isSaved ? { fill: "hsl(340 56% 40%)", color: "hsl(340 56% 40%)" } : {}} />
                </button>
              </div>

              <h3 className="font-semibold text-foreground text-sm leading-snug mb-1 group-hover:text-primary transition-colors">
                {ds.title}
              </h3>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <FileText className="w-3 h-3" /> {ds.provider}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 flex-1">{ds.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {ds.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md" style={{ background: "hsl(236 25% 93%)", color: "hsl(214 18% 40%)" }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-3 h-3 ${n <= Math.round(ds.rating) ? "" : "text-muted"}`}
                      style={n <= Math.round(ds.rating) ? { fill: "hsl(340 56% 40%)", color: "hsl(340 56% 40%)" } : {}} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">{ds.rating}</span>
                <span className="text-xs text-muted-foreground">({ds.reviews} reviews)</span>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Download className="w-3 h-3" /> {ds.downloads}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ds.records}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ds.updated}</span>
                  <span>{ds.access === "open" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 transition-all">
                    {isRegulator ? <Eye className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                    {isRegulator ? "Manage" : ds.access === "open" ? "Download" : "Request Access"}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataMarketplace;
