import { Moment } from "moment";
import { UnavailableDaysByRoomAndMonth } from "../../../entities/UnavailableDays";
import { IAirbnbCrawlerProvider } from "../../../providers/IAirbnbCrawlerProvider";
import { IUnavailableDaysRepository } from "../../../repositories/IUnavailableDaysRepository";

export class ComputeUnavailableDaysByRoomAndMonthUseCase {
  constructor(
    private readonly airbnbCrawler: IAirbnbCrawlerProvider,
    private readonly unavailableDaysRepository: IUnavailableDaysRepository
  ) {}

  async execute(roomIds: string[]): Promise<void> {
    const previouslyComputedUnavailableDaysByRoomAndMonth = await this.unavailableDaysRepository.loadUnavailableDays();
    const currentUnavailableDaysByRoomAndMonth = await this.getCurrentUnavailableDaysByRoomAndMonth(
      roomIds
    );
    currentUnavailableDaysByRoomAndMonth.mergeUnavailabilityData(
      previouslyComputedUnavailableDaysByRoomAndMonth
    );

    this.unavailableDaysRepository.upsertUnavailableDays(
      currentUnavailableDaysByRoomAndMonth
    );
  }

  private async getCurrentUnavailableDaysByRoomAndMonth(
    roomIds: string[]
  ): Promise<UnavailableDaysByRoomAndMonth> {
    return roomIds.reduce(async (accumulated, currentRoomId) => {
      const roomsAggregation = await accumulated;
      const roomUnavailableDays = await this.airbnbCrawler.listUnavailableDays(
        currentRoomId
      );
      this.addUnavailableDays(
        roomsAggregation,
        currentRoomId,
        roomUnavailableDays
      );
      return roomsAggregation;
    }, Promise.resolve(new UnavailableDaysByRoomAndMonth({})));
  }

  private addUnavailableDays(
    unavailableDays: UnavailableDaysByRoomAndMonth,
    roomId: string,
    unavailableDaysDates: Moment[]
  ): UnavailableDaysByRoomAndMonth {
    return unavailableDaysDates.reduce((accumulated, currentDayDate) => {
      const month = currentDayDate.format("M");
      const year = currentDayDate.format("YYYY");
      const day = currentDayDate.format("D");
      const monthKey = `${month}-${year}`;

      accumulated.addDay(roomId, monthKey, day);
      return accumulated;
    }, unavailableDays);
  }
}
