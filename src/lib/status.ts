export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  NO_SHOW: "Gelmedi",
};

export const STATUS_TONE: Record<string, "warning" | "info" | "success" | "neutral" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "neutral",
  NO_SHOW: "danger",
};
