import { UnavailableDaysByRoomAndMonth } from "../entities/UnavailableDays";

export interface IUnavailableDaysRepository {
  loadUnavailableDays(): Promise<UnavailableDaysByRoomAndMonth>;
  upsertUnavailableDays(unavailableDays: UnavailableDaysByRoomAndMonth): void;
}
