/**
 * TypeScript types for the dashboard summary data and the shape of each card displayed on the home page.
 * Uses: nothing — standalone file
 * Exports: DashboardSummary, DashboardCardData
 */
export interface DashboardSummary {
  company: {
    name: string;
    number: string;
    owner: string;
  };
  reikningar: {
    heildarFjoldi: number;
    ogreiddirFjoldi: number;
  };
  dkplus: {
    notendur: number;
    audkenningartokn: number;
  };
  leyfi: {
    virk: string[];
  };
  hysing: {
    fjoldiAdganga: number;
  };
  vidskiptavinir: {
    fjoldi: number;
  };
  zoho: {
    opnarBeidnir: number;
    lokadarBeidnir: number;
  };
}

export interface DashboardCardData {
  id: string;
  title: string;
  description: string;
  stats?: { label: string; value: string | number }[];
  alert?: string;
  to: string;
}
