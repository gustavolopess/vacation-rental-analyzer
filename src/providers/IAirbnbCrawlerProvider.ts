import { Moment } from "moment";

export interface IAirbnbCrawlerProvider {
  listUnavailableDays(roomId: string): Promise<Moment[]>;
}
