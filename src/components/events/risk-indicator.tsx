"use client";

import { RiskAnalysis } from "@/lib/risk-analysis-service";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
    analysis: RiskAnalysis;
    className?: string;
}

export function RiskIndicator({ analysis, className }: RiskIndicatorProps) {
    const config = {
        low: {
            color: "text-green-600 bg-green-50 border-green-200",
            icon: CheckCircle2,
            label: "Low Risk"
        },
        medium: {
            color: "text-amber-600 bg-amber-50 border-amber-200",
            icon: AlertTriangle,
            label: "Med Risk"
        },
        high: {
            color: "text-red-600 bg-red-50 border-red-200",
            icon: AlertCircle,
            label: "High Risk"
        }
    };

    const current = config[analysis.level];
    const Icon = current.icon;

    return (
        <div className="group relative inline-block">
            <div
                className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-help uppercase tracking-tight",
                    current.color,
                    className
                )}
            >
                <Icon className="h-3 w-3" />
                {current.label}
                <span className="opacity-70 tabular-nums">{analysis.score}%</span>
            </div>

            {/* Tooltip Content (Simple Hover) */}
            <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 p-4 bg-white rounded-xl shadow-2xl border border-slate-200 invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-bottom pointer-events-none group-hover:pointer-events-auto">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900">
                            <Icon className={cn("h-4 w-4", current.color.split(' ')[0])} />
                            Failure Prevention System
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal">
                            Continuous monitoring of registration trends, volunteer availability, and competitor events.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Detection Signals</p>
                        <ul className="space-y-1.5">
                            {analysis.signals.length > 0 ? (
                                analysis.signals.map((signal, i) => (
                                    <li key={i} className="text-[11px] flex gap-2 leading-tight text-slate-600">
                                        <span className="text-red-400 font-bold">•</span>
                                        {signal}
                                    </li>
                                ))
                            ) : (
                                <li className="text-[11px] text-green-600 flex gap-2 items-center leading-tight">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                    Healthy event metrics detected.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Prevention Recommendations</p>
                        <ul className="space-y-2">
                            {analysis.recommendations.map((rec, i) => (
                                <li key={i} className="text-[11px] flex gap-2 font-semibold text-slate-800 leading-tight bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Pointer Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 -mt-1.5" />
            </div>
        </div>
    );
}
