import type { PlanDTO, ScheduleItemDTO, DailyScheduleDTO } from "@/types/plan";

export const mapToPlanDTO = (
  planId: number,
  items: any[],
  basicInfo?: any
): PlanDTO => {
  let totalDays = 1;

  const start = basicInfo?.startDate ? new Date(basicInfo.startDate) : null;
  const end = basicInfo?.endDate ? new Date(basicInfo.endDate) : null;

  if (start && end) {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  const grouped = items.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ScheduleItemDTO[]>);

  const dailySchedules: DailyScheduleDTO[] = [];
  for (let i = 1; i <= totalDays; i++) {
    const sortedItems = (grouped[i] || []).sort(
      (a: ScheduleItemDTO, b: ScheduleItemDTO) =>
        (a.startTime || "")
          .toString()
          .localeCompare((b.startTime || "").toString())
    );

    let calculatedDate = "";
    if (start) {
      const dateCopy = new Date(start);
      dateCopy.setDate(start.getDate() + (i - 1));
      calculatedDate = dateCopy.toISOString().split("T")[0] || "";
    }

    dailySchedules.push({
      dayNumber: i,
      date: calculatedDate,
      items: sortedItems,
    });
  }

  return {
    id: planId.toString(),
    title: basicInfo?.title || "",
    startDate: basicInfo?.startDate || "",
    endDate: basicInfo?.endDate || "",
    planImageUrl: basicInfo?.planImageUrl || "",
    isShared: basicInfo?.isShared || false,
    participants: basicInfo?.participants || [],
    participantIds: basicInfo?.participantIds || [],
    ownerId: basicInfo?.ownerId || "",
    inviteCode: basicInfo?.inviteCode || "",
    dailySchedules: dailySchedules,
  } as PlanDTO;
};
