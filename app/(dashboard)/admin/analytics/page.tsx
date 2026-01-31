"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { analyticsService, DashboardStats, EventSuccessData, AttendanceTrend, HeatmapData, InterestStats } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuccessScoreChart } from "@/components/analytics/SuccessScoreChart";
import { AttendanceForecasting } from "@/components/analytics/AttendanceForecasting";
import { EngagementHeatmap } from "@/components/analytics/EngagementHeatmap";
import { InterestEngagementPlot } from "@/components/analytics/InterestEngagementPlot";
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [successData, setSuccessData] = useState<EventSuccessData[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [interestStats, setInterestStats] = useState<InterestStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'coordinator')) {
      router.push("/events");
      return;
    }

    const fetchData = async () => {
      try {
        const [s, succ, trend, heat, inter] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getTopEventsSuccess(),
          analyticsService.getAttendanceTrend(),
          analyticsService.getEngagementHeatmap(),
          analyticsService.getInterestEngagement()
        ]);
        
        setStats(s);
        setSuccessData(succ);
        setAttendanceTrend(trend);
        setHeatmap(heat);
        setInterestStats(inter);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Performance Intelligence</h1>
          <p className="text-slate-500 mt-1">Holistic analytics across events, users, and organizations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="rounded-xl bg-accent hover:bg-accent/90">
            <Filter className="h-4 w-4 mr-2" />
            Date Range: Last 30 Days
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Avg Success Score" 
          value={`${stats?.averageSuccessScore}%`} 
          trend="+5.2%" 
          trendUp={true} 
          icon={<Zap className="h-5 w-5 text-amber-500" />}
          description="Across all current events"
        />
        <MetricCard 
          title="Total Engagement" 
          value={stats?.totalAttendees.toLocaleString() || "0"} 
          trend="+12%" 
          trendUp={true} 
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          description="Event registrations"
        />
        <MetricCard 
          title="Active Volunteers" 
          value={stats?.activeVolunteers.toString() || "0"} 
          trend="+8%" 
          trendUp={true} 
          icon={<Zap className="h-5 w-5 text-emerald-500" />}
          description="Reliable community members"
        />
        <MetricCard 
          title="Scheduled Events" 
          value={stats?.totalEvents.toString() || "0"} 
          trend="-2%" 
          trendUp={false} 
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          description="Events in the pipeline"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Success Scores */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Event Success Leaderboard
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500">View Rankings</Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <SuccessScoreChart data={successData} />
          </CardContent>
        </Card>

        {/* Attendance Forecasting */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Attendance Forecasting
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500">Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AttendanceForecasting data={attendanceTrend} />
          </CardContent>
        </Card>

        {/* Activity Intensity */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-pink-500" />
              Platform Activity Intensity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EngagementHeatmap data={heatmap} />
          </CardContent>
        </Card>

        {/* Interest Distribution */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Community Interest Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <InterestEngagementPlot data={interestStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, trendUp, icon, description }: { 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="rounded-3xl border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
