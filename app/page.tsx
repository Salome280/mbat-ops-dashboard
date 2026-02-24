"use client";

import { useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { SummaryDashboard } from "@/components/SummaryDashboard";
import { SectionBoard } from "@/components/SectionBoard";
import { useTasksState } from "@/hooks/useTasksState";
import { AnyTask, TaskSection } from "@/types/tasks";
import { AuthGuard } from "@/components/AuthGuard";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<TaskSection>("Dashboard Summary");
  const { sections, summary, upsertTask, deleteTask, moveTaskInBoard } =
    useTasksState();

  const renderSection = () => {
    if (activeSection === "Dashboard Summary") {
      return (
        <SummaryDashboard
          totalSponsorsConfirmed={summary.totalSponsorsConfirmed}
          revenueSecured={summary.revenueSecured}
          revenueTarget={summary.revenueTarget}
          pipelineExpectedRevenue={summary.pipelineExpectedRevenue}
          upcomingDeadlines={summary.upcomingDeadlines}
          highPriorityTasks={summary.highPriorityTasks}
        />
      );
    }

    const map: Record<
      Exclude<TaskSection, "Dashboard Summary">,
      AnyTask[]
    > = {
      "Marketing Communication": sections.marketing,
      Merchandise: sections.merchandise,
      "Finance and Legal": sections.financeLegal,
      "School Relationships": sections.schoolRelationships,
      Sponsorship: sections.sponsorship
    };

    const tasks = map[activeSection as Exclude<TaskSection, "Dashboard Summary">];

    return (
      <SectionBoard
        section={activeSection as Exclude<TaskSection, "Dashboard Summary">}
        tasks={tasks}
        onUpsertTask={upsertTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTaskInBoard}
      />
    );
  };

  return (
    <AuthGuard>
      <LayoutShell activeSection={activeSection} onSectionChange={setActiveSection}>
        {renderSection()}
      </LayoutShell>
    </AuthGuard>
  );
}
