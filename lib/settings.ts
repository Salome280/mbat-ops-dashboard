export type TeamMember = { id: string; name: string; email?: string };

export type DashboardSettings = {
  revenueTarget: number;
  manualRevenueAdjustment: number;
  manualPipelineAdjustment: number;
  manualSponsorsConfirmedOverride: number | null;
  teamMembers: TeamMember[];
};

export const STORAGE_KEY = "mbat_settings_v1";

export const defaultSettings: DashboardSettings = {
  revenueTarget: 850_000,
  manualRevenueAdjustment: 0,
  manualPipelineAdjustment: 0,
  manualSponsorsConfirmedOverride: null,
  teamMembers: [
    { id: "1", name: "Comms Team" },
    { id: "2", name: "Sponsorship Team" },
    { id: "3", name: "Finance Team" }
  ]
};
