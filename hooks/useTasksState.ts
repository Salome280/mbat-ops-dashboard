import { useMemo, useState } from "react";
import {
  AnyTask,
  CommonTask,
  SponsorshipPipelineStage,
  SponsorshipTask,
  TaskPriority,
  TaskSection,
  TaskStatus
} from "@/types/tasks";

export type SectionKey =
  | "marketing"
  | "merchandise"
  | "financeLegal"
  | "schoolRelationships"
  | "sponsorship";

export type SectionState = {
  marketing: CommonTask[];
  merchandise: CommonTask[];
  financeLegal: CommonTask[];
  schoolRelationships: CommonTask[];
  sponsorship: SponsorshipTask[];
};

const REVENUE_TARGET = 850_000;

const nowIso = () => new Date().toISOString();

const createBaseTask = (
  section: Exclude<TaskSection, "Dashboard Summary">,
  overrides: Partial<AnyTask> = {}
): AnyTask => {
  // IMPORTANT: never allow overrides to change `section`
  const { section: _overrideSection, ...overridesNoSection } = overrides as any;

  const baseCommonNoSection: Omit<CommonTask, "section"> = {
    id: crypto.randomUUID(),
    title: "",
    status: "Not Started",
    priority: "Medium",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  if (section === "Sponsorship") {
    const s: SponsorshipTask = {
      ...baseCommonNoSection,
      pipelineStage: "Identified",
      dealValue: 0,
      contactName: "",
      probability: 0,
      expectedRevenue: 0,
      company: "",
      // apply overrides (without section)
      ...(overridesNoSection as Partial<SponsorshipTask>),
      // set section LAST as a literal so TS keeps it as "Sponsorship"
      section: "Sponsorship",
      updatedAt: nowIso()
    };

    return s;
  }

  const c: CommonTask = {
    ...baseCommonNoSection,
    ...(overridesNoSection as Partial<CommonTask>),
    section,
    updatedAt: nowIso()
  };

  return c;
};

export const useTasksState = () => {
  const [sections, setSections] = useState<SectionState>({
    marketing: [
      createBaseTask("Marketing Communication", {
        title: "Finalize MBAT email campaign",
        description: "Send final schedule and logistics email to all participants.",
        owner: "Comms Team",
        status: "In Progress",
        priority: "High"
      }) as CommonTask
    ],
    merchandise: [],
    financeLegal: [],
    schoolRelationships: [],
    sponsorship: [
      createBaseTask("Sponsorship", {
        title: "Secure renewal with Main Sponsor",
        company: "ACME Corp",
        contactName: "Jane Doe",
        pipelineStage: "Negotiating",
        dealValue: 50_000,
        probability: 70,
        expectedRevenue: 35_000,
        status: "In Progress",
        priority: "Critical",
        nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }) as SponsorshipTask,
      createBaseTask("Sponsorship", {
        title: "New lead: TechCo",
        company: "TechCo",
        contactName: "John Smith",
        pipelineStage: "Contacted",
        dealValue: 30_000,
        probability: 40,
        expectedRevenue: 12_000,
        status: "In Progress",
        priority: "High"
      }) as SponsorshipTask
    ]
  });

  const upsertTask = (task: AnyTask) => {
    setSections(prev => {
      const copy: SectionState = {
        marketing: [...prev.marketing],
        merchandise: [...prev.merchandise],
        financeLegal: [...prev.financeLegal],
        schoolRelationships: [...prev.schoolRelationships],
        sponsorship: [...prev.sponsorship]
      };

      const updateArray = (arr: AnyTask[]): AnyTask[] => {
        const idx = arr.findIndex(t => t.id === task.id);
        if (idx === -1) return [...arr, { ...task, updatedAt: nowIso() }];
        const next = [...arr];
        next[idx] = { ...task, updatedAt: nowIso() };
        return next;
      };

      switch (task.section) {
        case "Marketing Communication":
          copy.marketing = updateArray(copy.marketing) as CommonTask[];
          break;
        case "Merchandise":
          copy.merchandise = updateArray(copy.merchandise) as CommonTask[];
          break;
        case "Finance and Legal":
          copy.financeLegal = updateArray(copy.financeLegal) as CommonTask[];
          break;
        case "School Relationships":
          copy.schoolRelationships = updateArray(copy.schoolRelationships) as CommonTask[];
          break;
        case "Sponsorship":
          copy.sponsorship = updateArray(copy.sponsorship) as SponsorshipTask[];
          break;
      }

      return copy;
    });
  };

  const deleteTask = (task: AnyTask) => {
    setSections(prev => {
      const filter = (arr: AnyTask[]) => arr.filter(t => t.id !== task.id);
      return {
        marketing:
          task.section === "Marketing Communication"
            ? (filter(prev.marketing) as CommonTask[])
            : prev.marketing,
        merchandise:
          task.section === "Merchandise"
            ? (filter(prev.merchandise) as CommonTask[])
            : prev.merchandise,
        financeLegal:
          task.section === "Finance and Legal"
            ? (filter(prev.financeLegal) as CommonTask[])
            : prev.financeLegal,
        schoolRelationships:
          task.section === "School Relationships"
            ? (filter(prev.schoolRelationships) as CommonTask[])
            : prev.schoolRelationships,
        sponsorship:
          task.section === "Sponsorship"
            ? (filter(prev.sponsorship) as SponsorshipTask[])
            : prev.sponsorship
      };
    });
  };

  const moveTaskInBoard = (
    taskId: string,
    section: Exclude<TaskSection, "Dashboard Summary">,
    targetColumn: TaskStatus | SponsorshipPipelineStage
  ) => {
    setSections(prev => {
      const copy: SectionState = {
        marketing: [...prev.marketing],
        merchandise: [...prev.merchandise],
        financeLegal: [...prev.financeLegal],
        schoolRelationships: [...prev.schoolRelationships],
        sponsorship: [...prev.sponsorship]
      };

      const updateForArray = <T extends AnyTask>(arr: T[], update: (task: T) => T): T[] =>
        arr.map(t => (t.id === taskId ? update(t) : t));

      if (section === "Sponsorship") {
        copy.sponsorship = updateForArray(copy.sponsorship, t => ({
          ...t,
          pipelineStage: targetColumn as SponsorshipPipelineStage,
          updatedAt: nowIso()
        })) as SponsorshipTask[];
      } else {
        const status = targetColumn as TaskStatus;
        switch (section) {
          case "Marketing Communication":
            copy.marketing = updateForArray(copy.marketing, t => ({ ...t, status, updatedAt: nowIso() })) as CommonTask[];
            break;
          case "Merchandise":
            copy.merchandise = updateForArray(copy.merchandise, t => ({ ...t, status, updatedAt: nowIso() })) as CommonTask[];
            break;
          case "Finance and Legal":
            copy.financeLegal = updateForArray(copy.financeLegal, t => ({ ...t, status, updatedAt: nowIso() })) as CommonTask[];
            break;
          case "School Relationships":
            copy.schoolRelationships = updateForArray(copy.schoolRelationships, t => ({ ...t, status, updatedAt: nowIso() })) as CommonTask[];
            break;
        }
      }

      return copy;
    });
  };

  const summary = useMemo(() => {
    const sponsorship = sections.sponsorship;
    const totalSponsorsConfirmed = sponsorship.filter(t => t.pipelineStage === "Confirmed").length;

    const revenueSecured = sponsorship
      .filter(t => t.pipelineStage === "Confirmed")
      .reduce((sum, t) => sum + t.dealValue, 0);

    const pipelineExpectedRevenue = sponsorship.reduce(
      (sum, t) => sum + (t.expectedRevenue ?? (t.dealValue * (t.probability ?? 0)) / 100),
      0
    );

    const allTasks: AnyTask[] = [
      ...sections.marketing,
      ...sections.merchandise,
      ...sections.financeLegal,
      ...sections.schoolRelationships,
      ...sections.sponsorship
    ];

    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = allTasks
      .filter(t => t.deadline)
      .filter(t => {
        const d = new Date(t.deadline!);
        return d >= now && d <= in14Days;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 5);

    const priorityRank: Record<TaskPriority, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1
    };

    const highPriorityTasks = allTasks
      .filter(t => t.priority === "Critical" || t.priority === "High")
      .sort(
        (a, b) =>
          priorityRank[b.priority] - priorityRank[a.priority] ||
          new Date(a.deadline ?? "").getTime() - new Date(b.deadline ?? "").getTime()
      )
      .slice(0, 5);

    return {
      totalSponsorsConfirmed,
      revenueSecured,
      revenueTarget: REVENUE_TARGET,
      pipelineExpectedRevenue,
      upcomingDeadlines,
      highPriorityTasks
    };
  }, [sections]);

  return {
    sections,
    summary,
    upsertTask,
    deleteTask,
    moveTaskInBoard
  };
};