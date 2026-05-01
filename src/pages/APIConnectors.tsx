import {
  Plug, CheckCircle2, AlertCircle, Clock, Plus, ExternalLink,
  RefreshCw, Settings, Trash2, Eye, EyeOff, Activity,
  Zap, Shield, Globe, ArrowRight, Copy, Database, Snowflake,
  ChevronDown, Info,
} from "lucide-react";
import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";

const allConnectors = [
  {
    id: 1, name: "GEMS Wellington — REST API", endpoint: "https://api.gemswellington.ae/v2/data",
    auth: "Bearer Token", status: "active", lastSync: "3 min ago", type: "REST API",
    datasets: ["Enrollment", "Faculty", "Performance"], uptime: "99.8%", calls24h: "1,248",
    icon: "api", owner: "regulator",
  },
  {
    id: 2, name: "Repton School — Snowflake Share", endpoint: "reptondubai.snowflakecomputing.com",
    auth: "Snowflake OAuth", status: "active", lastSync: "8 min ago", type: "Snowflake",
    datasets: ["Enrollment", "Staff Data"], uptime: "99.9%", calls24h: "892",
    icon: "snowflake", owner: "both",
  },
  {
    id: 3, name: "Dubai British School — Databricks", endpoint: "adb-dbs.azuredatabricks.net/api",
    auth: "Delta Sharing", status: "active", lastSync: "22 min ago", type: "Databricks",
    datasets: ["Student Performance", "Faculty Data"], uptime: "99.5%", calls24h: "634",
    icon: "databricks", owner: "both",
  },
  {
    id: 4, name: "GEMS Modern Academy — REST API", endpoint: "https://api.gemsmodern.ae/opendata",
    auth: "OAuth 2.0", status: "error", lastSync: "2 hours ago", type: "REST API",
    datasets: ["Student Data", "Teacher Registry"], uptime: "94.1%", calls24h: "0",
    icon: "api", owner: "regulator",
  },
  {
    id: 5, name: "My School API Connection", endpoint: "api.gemswellington.ae/v2",
    auth: "Bearer Token", status: "active", lastSync: "5 min ago", type: "REST API",
    datasets: ["Enrollment", "Performance"], uptime: "99.9%", calls24h: "412",
    icon: "api", owner: "institution",
  },
];

const typeStyles: Record<string, { bg: string; color: string; icon: string }> = {
  "REST API": { bg: "hsl(224 100% 91%)", color: "hsl(224 100% 38%)", icon: "🔌" },
  "Snowflake": { bg: "hsl(200 100% 92%)", color: "hsl(200 100% 35%)", icon: "❄️" },
  "Databricks": { bg: "hsl(25 100% 93%)", color: "hsl(25 90% 40%)", icon: "⚡" },
};

const statusConfig = {
  active: { label: "Active", className: "badge-success" },
  error: { label: "Error", className: "badge-error" },
  pending: { label: "Pending", className: "badge-pending" },
};

const connectorChannels = [
  {
    type: "REST API", title: "REST / JSON API",
    description: "Any school with a REST endpoint. Supports OAuth 2.0, Bearer Token, and API Key auth.",
    useCase: "Best for schools with existing SIS APIs",
    icon: "🔌", bg: "hsl(224 100% 91%)", color: "hsl(224 100% 38%)",
  },
  {
    type: "Snowflake", title: "Snowflake Data Sharing",
    description: "Zero-copy data sharing via Snowflake Marketplace. No ETL required — live data access.",
    useCase: "Best for school groups with data warehouses",
    icon: "❄️", bg: "hsl(200 100% 92%)", color: "hsl(200 100% 35%)",
  },
  {
    type: "Databricks", title: "Databricks Delta Sharing",
    description: "Open protocol for sharing live data from Databricks lakehouses across organizations.",
    useCase: "Best for large school operators",
    icon: "⚡", bg: "hsl(25 100% 93%)", color: "hsl(25 90% 40%)",
  },
  {
    type: "Excel", title: "Excel / CSV Upload",
    description: "Manual file upload with automated schema validation. No API required.",
    useCase: "Best for individual schools without APIs",
    icon: "📊", bg: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)",
  },
];

const APIConnectors = () => {
  const { isRegulator } = useRole();
  const [showKey, setShowKey] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const myConnectors = allConnectors.filter(c =>
    isRegulator ? c.owner === "regulator" || c.owner === "both" : c.owner === "institution" || c.owner === "both"
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            {isRegulator ? "School Connectors" : "My Data Connectors"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRegulator
              ? "Manage all live data feeds — REST API, Snowflake, and Databricks integrations"
              : "Connect your school's data infrastructure to the KHDA data platform"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> New Connection
        </button>
      </div>

      {/* Channel Overview */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Supported connection channels
        </div>
        <div className="grid grid-cols-4 gap-3">
          {connectorChannels.map(ch => (
            <div key={ch.type} className="bg-card border border-border rounded-xl p-4 hover:shadow-elevated transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{ch.icon}</span>
                <span className="text-sm font-semibold text-foreground">{ch.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{ch.description}</p>
              <div className="text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ background: ch.bg, color: ch.color }}>
                {ch.useCase}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Connections", value: myConnectors.filter(c => c.status === "active").length.toString(), icon: Zap, bg: "hsl(224 100% 91%)", color: "hsl(224 100% 38%)" },
          { label: "Avg. Uptime", value: "99.3%", icon: Activity, bg: "hsl(152 55% 92%)", color: "hsl(152 69% 31%)" },
          { label: "API Calls (24h)", value: "3,186", icon: Globe, bg: "hsl(340 52% 88%)", color: "hsl(340 56% 40%)" },
          { label: "Connection Types", value: "3", icon: Shield, bg: "hsl(214 67% 14% / 0.08)", color: "hsl(214 67% 24%)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: s.bg }}>
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
            </div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active connections */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active connections</div>
        <div className="space-y-2.5">
          {myConnectors.map(conn => {
            const s = statusConfig[conn.status as keyof typeof statusConfig];
            const tc = typeStyles[conn.type];
            const isExpanded_ = expanded === conn.id;
            return (
              <div key={conn.id} className={`connector-card transition-all ${isExpanded_ ? "border-primary/30" : ""}`}
                style={isExpanded_ ? { borderColor: "hsl(214 67% 14% / 0.3)", boxShadow: "var(--shadow-elevated)" } : {}}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded_ ? null : conn.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: tc.bg }}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{conn.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: tc.bg, color: tc.color }}>
                        {conn.type}
                      </span>
                    </div>
                    <code className="text-[11px] text-muted-foreground font-mono">{conn.endpoint}</code>
                  </div>
                  <div className="flex items-center gap-5 text-xs flex-shrink-0">
                    <div className="text-center">
                      <div className="font-bold text-foreground">{conn.calls24h}</div>
                      <div className="text-muted-foreground text-[10px]">calls/24h</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-foreground">{conn.uptime}</div>
                      <div className="text-muted-foreground text-[10px]">uptime</div>
                    </div>
                    <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {conn.lastSync}
                    </div>
                    <span className={s.className}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" onClick={e => e.stopPropagation()}>
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" onClick={e => e.stopPropagation()}>
                      <Settings className="w-4 h-4" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded_ ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isExpanded_ && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-5">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Authentication</div>
                      <div className="text-sm font-semibold text-foreground mb-2">{conn.auth}</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[11px] font-mono px-2 py-1.5 bg-muted rounded-lg text-muted-foreground">
                          {showKey === conn.id ? "sk_live_*****xK92p" : "••••••••••••••••"}
                        </code>
                        <button onClick={() => setShowKey(showKey === conn.id ? null : conn.id)}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                          {showKey === conn.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Linked Datasets</div>
                      <div className="flex flex-wrap gap-1.5">
                        {conn.datasets.map(d => (
                          <span key={d} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: "hsl(340 52% 88%)", color: "hsl(340 56% 35%)" }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Actions</div>
                      <div className="space-y-1.5">
                        <button className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> View API documentation
                        </button>
                        <button className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Force sync now
                        </button>
                        {conn.status === "error" && (
                          <button className="flex items-center gap-2 text-xs" style={{ color: "hsl(0 72% 51%)" }}>
                            <AlertCircle className="w-3.5 h-3.5" /> View error logs
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add connector CTA */}
      <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "hsl(340 52% 88%)" }}>
          <Plus className="w-5 h-5" style={{ color: "hsl(340 56% 40%)" }} />
        </div>
        <div className="font-semibold text-sm text-foreground mb-1">Add a new connection</div>
        <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
          Connect via REST API, Snowflake Data Sharing, Databricks Delta Sharing, or use the Excel upload portal for schools without APIs.
        </p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
          + Add Connector
        </button>
      </div>
    </div>
  );
};

export default APIConnectors;
