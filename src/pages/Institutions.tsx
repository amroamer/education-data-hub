import {
  Building2, Search, Filter, Plus, MapPin, Users, Plug, FileSpreadsheet,
  ChevronRight, Globe, Phone, Mail, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { useState } from "react";

const institutions = [
  {
    id: 1, name: "GEMS Wellington Academy", type: "British Curriculum", region: "Al Khail",
    students: "3,800", staff: "420", connection: "API", status: "active",
    lastSubmission: "3 hours ago", compliance: 98, contact: "data@gemswellington.ae",
    website: "gemswellington.ae",
  },
  {
    id: 2, name: "Dubai British School", type: "British Curriculum", region: "Emirates Hills",
    students: "2,200", staff: "280", connection: "API", status: "active",
    lastSubmission: "18 min ago", compliance: 99, contact: "info@dubaibritishschool.ae",
    website: "dubaibritishschool.ae",
  },
  {
    id: 3, name: "Jumeirah English Speaking School", type: "British Curriculum", region: "Arabian Ranches",
    students: "1,800", staff: "210", connection: "Excel", status: "active",
    lastSubmission: "5 hours ago", compliance: 82, contact: "admin@jess.sch.ae",
    website: "jess.sch.ae",
  },
  {
    id: 4, name: "Repton School Dubai", type: "British Curriculum", region: "Nad Al Sheba",
    students: "2,400", staff: "310", connection: "API", status: "active",
    lastSubmission: "7 min ago", compliance: 97, contact: "data@reptondubai.org",
    website: "reptondubai.org",
  },
  {
    id: 5, name: "GEMS Modern Academy", type: "Indian Curriculum", region: "Nad Al Sheba",
    students: "4,200", staff: "380", connection: "Excel", status: "overdue",
    lastSubmission: "21 days ago", compliance: 54, contact: "admin@gemsmodernacademy.com",
    website: "gemsmodernacademy.com",
  },
  {
    id: 6, name: "Swiss International Scientific School", type: "IB Curriculum", region: "Healthcare City",
    students: "1,200", staff: "160", connection: "Pending", status: "pending",
    lastSubmission: "Not yet connected", compliance: 0, contact: "info@sisd.ae",
    website: "sisd.ae",
  },
  {
    id: 7, name: "Dubai International Academy", type: "IB Curriculum", region: "Emirates Hills",
    students: "2,800", staff: "320", connection: "Excel", status: "active",
    lastSubmission: "1 day ago", compliance: 91, contact: "data@diadubai.com",
    website: "diadubai.com",
  },
  {
    id: 8, name: "The Indian High School", type: "Indian Curriculum", region: "Oud Metha",
    students: "5,600", staff: "420", connection: "API", status: "active",
    lastSubmission: "2 hours ago", compliance: 93, contact: "reporting@ihs.ae",
    website: "ihs.ae",
  },
];

const statusConfig = {
  active: { label: "Active", className: "badge-success" },
  overdue: { label: "Overdue", className: "badge-error" },
  pending: { label: "Pending Setup", className: "badge-pending" },
};

const typeColors: Record<string, string> = {
  "British Curriculum": "hsl(340 56% 40%)",
  "Indian Curriculum": "hsl(224 100% 38%)",
  "IB Curriculum": "hsl(152 69% 31%)",
  "American Curriculum": "hsl(214 67% 24%)",
};

const Institutions = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const types = ["All", "British Curriculum", "Indian Curriculum", "IB Curriculum", "American Curriculum"];

  const filtered = institutions.filter(inst =>
    (filterType === "All" || inst.type === filterType) &&
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">School Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registered private schools in the KHDA data exchange network across Dubai
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Register School
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Schools", value: "215", sub: "across Dubai", color: "hsl(340 56% 40%)", bg: "hsl(340 52% 88%)" },
          { label: "API-Connected", value: "68", sub: "live feeds active", color: "hsl(224 100% 38%)", bg: "hsl(224 100% 91%)" },
          { label: "Excel Submitters", value: "132", sub: "manual upload", color: "hsl(214 67% 24%)", bg: "hsl(214 67% 14% / 0.08)" },
          { label: "Compliance ≥ 90%", value: "78%", sub: "+8pp vs prior term", color: "hsl(152 69% 31%)", bg: "hsl(152 55% 92%)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: s.bg }}>
              <Building2 className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            <div className="text-[11px] mt-1" style={{ color: s.color }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by school name or area…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterType === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full">
          <thead>
            <tr>
              {["School", "Curriculum", "Area", "Students", "Connection", "Compliance", "Last Submission", "Status", ""].map(h => (
                <th key={h} className="data-table-header text-left px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst) => {
              const s = statusConfig[inst.status as keyof typeof statusConfig];
              const complianceColor = inst.compliance >= 90 ? "hsl(152 69% 31%)" : inst.compliance >= 70 ? "hsl(36 100% 36%)" : "hsl(0 72% 51%)";
              return (
                <tr key={inst.id} className="data-table-row cursor-pointer group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(340 52% 88%)" }}>
                        <Building2 className="w-4 h-4" style={{ color: "hsl(340 56% 40%)" }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{inst.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Globe className="w-2.5 h-2.5" /> {inst.website}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${typeColors[inst.type] || "hsl(214 67% 24%)"}18`, color: typeColors[inst.type] || "hsl(214 67% 24%)" }}>
                      {inst.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {inst.region}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {inst.students}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={
                        inst.connection === "API"
                          ? { background: "hsl(224 100% 91%)", color: "hsl(224 100% 38%)" }
                          : inst.connection === "Excel"
                          ? { background: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)" }
                          : { background: "hsl(236 25% 92%)", color: "hsl(214 18% 46%)" }
                      }>
                      {inst.connection === "API" ? <Plug className="w-3 h-3" /> : inst.connection === "Excel" ? <FileSpreadsheet className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inst.connection}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {inst.compliance > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                          <div className="h-full rounded-full transition-all" style={{ width: `${inst.compliance}%`, background: complianceColor }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: complianceColor }}>{inst.compliance}%</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {inst.lastSubmission}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={s.className}>{s.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {institutions.length} schools</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Page 1 of 27</span>
            <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-card transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Institutions;
