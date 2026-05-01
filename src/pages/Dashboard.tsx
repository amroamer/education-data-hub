import {
  School, TrendingUp, CheckCircle2, AlertCircle, Clock, ArrowUpRight,
  ArrowRight, Database, FileSpreadsheet, Plug, RefreshCw, Calendar,
  ShoppingBag, Upload, Users, Target, AlertTriangle, Star,
  BookOpen, ChevronRight, Bell,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useRole } from "@/contexts/RoleContext";

const submissionTrend = [
  { month: "Aug", count: 34 }, { month: "Sep", count: 52 }, { month: "Oct", count: 61 },
  { month: "Nov", count: 48 }, { month: "Dec", count: 39 }, { month: "Jan", count: 72 },
  { month: "Feb", count: 89 }, { month: "Mar", count: 96 },
];

const recentSubmissions = [
  { institution: "GEMS Wellington Academy", type: "API", dataset: "Enrollment T2 2024-25", submitted: "2h ago", status: "passed", rows: "3,482" },
  { institution: "Dubai British School", type: "Excel", dataset: "Staff Qualifications", submitted: "5h ago", status: "warning", rows: "441" },
  { institution: "Jumeirah English Speaking School", type: "Excel", dataset: "Student Performance", submitted: "8h ago", status: "failed", rows: "1,208" },
  { institution: "Repton School Dubai", type: "API", dataset: "Infrastructure Audit", submitted: "1d ago", status: "passed", rows: "186" },
  { institution: "Dubai International Academy", type: "Excel", dataset: "Enrollment T2 2024-25", submitted: "1d ago", status: "passed", rows: "2,892" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  passed: { label: "Passed", className: "badge-success" },
  warning: { label: "Warning", className: "badge-warning" },
  failed: { label: "Failed", className: "badge-error" },
  pending: { label: "Pending", className: "badge-pending" },
};

const typeColors: Record<string, { bg: string; color: string }> = {
  API: { bg: "hsl(224 100% 91%)", color: "hsl(224 100% 38%)" },
  Excel: { bg: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)" },
  Snowflake: { bg: "hsl(200 100% 92%)", color: "hsl(200 100% 35%)" },
  Databricks: { bg: "hsl(25 100% 93%)", color: "hsl(25 90% 40%)" },
};

/* ─── Regulator Dashboard ─── */
const RegulatorDashboard = () => (
  <div className="space-y-5 animate-fade-in">
    {/* Hero */}
    <div className="relative rounded-2xl overflow-hidden h-36"
      style={{ background: "linear-gradient(135deg, hsl(214 67% 10%) 0%, hsl(214 55% 18%) 50%, hsl(340 56% 30%) 100%)" }}>
      <div className="relative z-10 h-full flex items-center px-7 gap-8">
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(340 56% 65%)" }}>
            Academic Year 2024-25 · Term 2 Active
          </div>
          <h1 className="font-display text-white text-xl mb-1">KHDA School Inspection Data Platform</h1>
          <p className="text-white/65 text-xs">Inspector view · Dubai private schools · 215 schools reporting</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold hover:brightness-105 transition-all"
            style={{ background: "hsl(340 56% 40%)", color: "white" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Sync All
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-xs font-medium hover:bg-white/20 transition-all">
            <Calendar className="w-3.5 h-3.5" /> T2 Report
          </button>
        </div>
      </div>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Private Schools", value: "215", sub: "+4 this term", icon: School, iconColor: "hsl(340 56% 40%)", iconBg: "hsl(340 52% 88%)" },
        { label: "Live API Feeds", value: "68", sub: "+5 this week", icon: Plug, iconColor: "hsl(224 100% 38%)", iconBg: "hsl(224 100% 91%)" },
        { label: "Submissions MTD", value: "1,416", sub: "+18% vs. prior", icon: Database, iconColor: "hsl(214 67% 24%)", iconBg: "hsl(214 67% 14% / 0.08)" },
        { label: "Pass Rate", value: "91.2%", sub: "+3.1pp this term", icon: CheckCircle2, iconColor: "hsl(152 69% 31%)", iconBg: "hsl(152 55% 92%)" },
      ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.iconBg }}>
              <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          <div className="text-[11px] text-success mt-1 font-medium">{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Charts + Alerts */}
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 bg-card rounded-xl border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-foreground text-sm">Submission Volume</div>
            <div className="text-xs text-muted-foreground">8-month trend</div>
          </div>
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <TrendingUp className="w-3 h-3" /> +34%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={submissionTrend}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(340 56% 40%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(340 56% 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(214 18% 46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(214 18% 46%)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(236 20% 87%)", borderRadius: "8px", fontSize: "11px" }} />
            <Area type="monotone" dataKey="count" stroke="hsl(340 56% 40%)" strokeWidth={2} fill="url(#sg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pending Actions */}
      <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: "hsl(340 56% 40%)" }} /> Pending Actions
        </div>
        {[
          { label: "Awaiting review", count: 18, color: "hsl(36 100% 50%)", icon: Clock },
          { label: "Failed validation", count: 7, color: "hsl(0 72% 51%)", icon: AlertTriangle },
          { label: "Schema mismatch", count: 3, color: "hsl(0 72% 51%)", icon: AlertCircle },
          { label: "New API requests", count: 5, color: "hsl(224 100% 38%)", icon: Plug },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}18` }}>
              <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
            </div>
            <span className="text-xs text-foreground flex-1">{a.label}</span>
            <span className="text-sm font-bold" style={{ color: a.color }}>{a.count}</span>
          </div>
        ))}
        <button className="mt-3 w-full text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1">
          Review queue <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>

    {/* Submissions Table */}
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="font-semibold text-foreground text-sm">Recent Submissions</div>
        <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            {["School", "Channel", "Dataset", "Submitted", "Records", "Status"].map(h => (
              <th key={h} className="data-table-header text-left px-5 py-2.5 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentSubmissions.map((row, i) => {
            const s = statusConfig[row.status];
            const tc = typeColors[row.type] || typeColors.API;
            return (
              <tr key={i} className="data-table-row cursor-pointer">
                <td className="px-5 py-2.5 text-sm font-medium text-foreground">{row.institution}</td>
                <td className="px-5 py-2.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>
                    {row.type === "API" ? <Plug className="w-2.5 h-2.5" /> : <FileSpreadsheet className="w-2.5 h-2.5" />}
                    {row.type}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-sm text-foreground">{row.dataset}</td>
                <td className="px-5 py-2.5 text-xs text-muted-foreground">{row.submitted}</td>
                <td className="px-5 py-2.5 text-xs font-mono text-muted-foreground">{row.rows}</td>
                <td className="px-5 py-2.5"><span className={s.className}>{s.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/* ─── School Dashboard ─── */
const mySubmissions = [
  { dataset: "Enrollment Data T2 2024-25", due: "Mar 15, 2025", status: "submitted", progress: 100, channel: "API" },
  { dataset: "Staff Qualifications 2024-25", due: "Mar 31, 2025", status: "in_review", progress: 80, channel: "Excel" },
  { dataset: "DSIB Self-Evaluation", due: "Apr 15, 2025", status: "due", progress: 0, channel: "Excel" },
  { dataset: "Infrastructure & Safety Audit", due: "Apr 30, 2025", status: "due", progress: 0, channel: "Excel" },
];

const myStatusConfig: Record<string, { label: string; badge: string; color: string }> = {
  submitted: { label: "Submitted ✓", badge: "badge-success", color: "hsl(152 69% 31%)" },
  in_review: { label: "In Review", badge: "badge-warning", color: "hsl(36 100% 36%)" },
  due: { label: "Due Soon", badge: "badge-error", color: "hsl(0 72% 51%)" },
};

const featuredDatasets = [
  { title: "UAE National Curriculum Framework 2025", provider: "MoE UAE", downloads: "8.4K", rating: 4.9, access: "open" },
  { title: "Teacher Salary Benchmarks — Dubai", provider: "KHDA", downloads: "5.1K", rating: 4.7, access: "restricted" },
  { title: "Student Wellbeing Survey Results", provider: "KHDA", downloads: "6.8K", rating: 4.8, access: "open" },
];

const InstitutionDashboard = () => (
  <div className="space-y-5 animate-fade-in">
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">KHDA Rating</div>
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(236 25% 90%)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(152 69% 31%)" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 50 * 0.93} ${2 * Math.PI * 50 * 0.07}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">93%</span>
            <span className="text-[10px] text-success font-semibold">+4pp</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">2024-25 · GEMS Wellington Academy</div>
        <div className="mt-3 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "hsl(152 55% 92%)", color: "hsl(152 69% 31%)" }}>
          Very Good
        </div>
      </div>

      <div className="col-span-2 bg-card rounded-2xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-foreground text-sm">My Reporting Pipeline</div>
            <div className="text-xs text-muted-foreground">T2 2024-25 — 1 submitted, 1 in review, 2 pending</div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:brightness-110 transition-all">
            <Upload className="w-3.5 h-3.5" /> Submit Now
          </button>
        </div>
        <div className="space-y-2.5">
          {mySubmissions.map((s, i) => {
            const sc = myStatusConfig[s.status];
            const tc = typeColors[s.channel] || typeColors.API;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{s.dataset}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: tc.bg, color: tc.color }}>{s.channel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.progress === 100 ? "hsl(152 69% 31%)" : s.progress > 0 ? "hsl(36 100% 50%)" : "hsl(236 25% 85%)" }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">Due {s.due}</span>
                  </div>
                </div>
                <span className={`${sc.badge} flex-shrink-0`}>{sc.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Datasets I Use", value: "8", sub: "from KHDA", icon: BookOpen, iconBg: "hsl(340 52% 88%)", iconColor: "hsl(340 56% 40%)" },
        { label: "Submissions (YTD)", value: "24", sub: "6 this term", icon: Upload, iconBg: "hsl(224 100% 91%)", iconColor: "hsl(224 100% 38%)" },
        { label: "Active Connectors", value: "2", sub: "API + Excel", icon: Plug, iconBg: "hsl(200 100% 92%)", iconColor: "hsl(200 100% 35%)" },
        { label: "Pass Rate", value: "96.4%", sub: "last 12 months", icon: Target, iconBg: "hsl(152 55% 92%)", iconColor: "hsl(152 69% 31%)" },
      ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: s.iconBg }}>
            <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
          </div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Recommended datasets */}
    <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: "hsl(340 56% 40%)" }} /> Recommended Datasets
          </div>
          <div className="text-xs text-muted-foreground">Based on your school type and curriculum</div>
        </div>
        <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
          Browse all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {featuredDatasets.map((ds, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-border hover:border-primary/20 hover:shadow-elevated transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(214 67% 14% / 0.07)", color: "hsl(214 67% 16%)" }}>
                {ds.access === "open" ? "Open" : "Restricted"}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Star className="w-3 h-3" style={{ fill: "hsl(340 56% 40%)", color: "hsl(340 56% 40%)" }} /> {ds.rating}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground mb-1 leading-snug">{ds.title}</div>
            <div className="text-[11px] text-muted-foreground">{ds.provider} · {ds.downloads} downloads</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { isRegulator } = useRole();
  return isRegulator ? <RegulatorDashboard /> : <InstitutionDashboard />;
};

export default Dashboard;
