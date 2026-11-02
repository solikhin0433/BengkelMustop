"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";

interface KPIItem {
  title: string;
  value: string;
  sub: string;
  icon: string;
  bg: string;
  text: string;
}

interface WorkOrderKPIProps {
  kpis: KPIItem[];
}

export default function WorkOrderKPI({ kpis }: WorkOrderKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <CardBox key={idx} className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {kpi.title}
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              {kpi.value}
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              {kpi.sub}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.text}`}
          >
            <Icon icon={kpi.icon} className="h-6 w-6" />
          </div>
        </CardBox>
      ))}
    </div>
  );
}
