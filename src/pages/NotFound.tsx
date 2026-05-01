import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(220 26% 96%)" }}>
    <div className="text-center">
      <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4 opacity-30" />
      <h1 className="font-display text-4xl text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Link to="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
        Return to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
