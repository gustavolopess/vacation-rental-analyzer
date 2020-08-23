export interface UnavailabilityByRoomAndMonth {
  [roomId: string]: MonthUnavailability;
}

type UnavailableDays = Set<string>;

export interface MonthUnavailability {
  [month: string]: UnavailableDays;
}

export class UnavailableDaysByRoomAndMonth {
  constructor(private readonly unavailability: UnavailabilityByRoomAndMonth) {}

  addDay(roomId: string, month: string, day: string): void {
    this.ensureRoomExists(roomId);
    this.ensureMonthExists(roomId, month);
    this.unavailability[roomId][month].add(day);
  }

  mergeUnavailabilityData(
    otherUnavailabilityData: UnavailableDaysByRoomAndMonth
  ): void {
    for (const roomId in otherUnavailabilityData) {
      const otherRoomData = this.unavailability[roomId];
      for (const month in otherRoomData) {
        const otherRoomMonthUnavailableDays = otherRoomData[month];
        otherRoomMonthUnavailableDays.forEach((day) => {
          this.addDay(roomId, month, day);
        });
      }
    }
  }

  private ensureRoomExists(roomId: string) {
    if (this.unavailability[roomId] == null) {
      this.unavailability[roomId] = {};
    }
  }

  private ensureMonthExists(roomId: string, month: string) {
    if (this.unavailability[roomId][month] == null) {
      this.unavailability[roomId][month] = new Set<string>();
    }
  }
}
