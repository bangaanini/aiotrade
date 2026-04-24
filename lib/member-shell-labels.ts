export type MemberShellLabels = {
  accountGroup: string;
  accountItems: {
    landingPage: string;
    profile: string;
    resetPassword: string;
  };
  adminPanel: string;
  closeMenu: string;
  dashboardTitle: string;
  guideGroup: string;
  guideItems: {
    files: string;
    setupBot: string;
    start: string;
    strategy: string;
  };
  loginAs: string;
  logout: string;
  memberArea: string;
  mobileTitles: {
    accountLandingPage: string;
    accountProfile: string;
    accountResetPassword: string;
    dashboard: string;
    fallback: string;
    guideFiles: string;
    guideSetupBot: string;
    guideStart: string;
    guideStrategy: string;
    subscription: string;
  };
  openMenu: string;
  primaryItems: {
    dashboard: string;
    subscription: string;
  };
  sidebarDescription: string;
  sidebarTitle: string;
};

export const defaultMemberShellLabels: MemberShellLabels = {
  accountGroup: "Akun",
  accountItems: {
    landingPage: "Landing Page",
    profile: "Profil",
    resetPassword: "Reset Password",
  },
  adminPanel: "Admin Panel",
  closeMenu: "Tutup menu",
  dashboardTitle: "Dashboard Member",
  guideGroup: "Panduan",
  guideItems: {
    files: "File PDF",
    setupBot: "Setup Bot",
    start: "Mulai",
    strategy: "Materi Lanjutan",
  },
  loginAs: "Login sebagai",
  logout: "Log out",
  memberArea: "Member Area",
  mobileTitles: {
    accountLandingPage: "Akun: Landing Page",
    accountProfile: "Akun: Profil",
    accountResetPassword: "Akun: Reset Password",
    dashboard: "Dashboard",
    fallback: "Dashboard Member",
    guideFiles: "Panduan: File PDF",
    guideSetupBot: "Panduan: Setup Bot",
    guideStart: "Panduan: Mulai",
    guideStrategy: "Panduan: Materi Lanjutan",
    subscription: "Langganan",
  },
  openMenu: "Buka menu",
  primaryItems: {
    dashboard: "Dashboard",
    subscription: "Langganan",
  },
  sidebarDescription: "Akses informasi akun dan panduan.",
  sidebarTitle: "Dashboard Member",
};
