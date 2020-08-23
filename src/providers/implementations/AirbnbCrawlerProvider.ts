import moment from "moment";
import { Moment } from "moment";
import { Browser, Page } from "puppeteer";
import { IAirbnbCrawlerProvider } from "../IAirbnbCrawlerProvider";

export class AirbnbCrawlerProvider implements IAirbnbCrawlerProvider {
  private airbnbUrl = "https://airbnb.com";
  private unavailableDayClassName = "._1rilrsgy";

  constructor(private readonly browser: Browser) {}

  async listUnavailableDays(roomId: string): Promise<Moment[]> {
    const page = await this.initRoomPage(roomId);
    return this.getNextUnavailableCalendarDaysFromPage(page);
  }

  private async initRoomPage(roomId: string): Promise<Page> {
    const roomUrl = `${this.airbnbUrl}/rooms/${roomId}`;
    const page = await this.browser.newPage();
    await page.goto(roomUrl, { waitUntil: "networkidle0" });

    return page;
  }

  private async getNextUnavailableCalendarDaysFromPage(
    page: Page
  ): Promise<Moment[]> {
    const nextUnavailableCalendarDays = await page.evaluate(() => {
      const elements = document.querySelectorAll(this.unavailableDayClassName);
      const nextCalendarDays = Array.from(elements, (e) =>
        e.getAttribute("data-testid")
      );
      return nextCalendarDays;
    });

    const nextUnavailableDays = (nextUnavailableCalendarDays as string[])
      .map(this.calendarDayToMoment)
      .filter(this.isDateSameOrAfterToday);

    return nextUnavailableDays;
  }

  private calendarDayToMoment(calendarDay: string): Moment {
    const matches = /calendar-day-(.+)/i.exec(calendarDay);
    if (matches == null) {
      throw new Error("Invalid calendar day string");
    }

    const dateStr = matches[1];

    const date = moment(dateStr, "MM/DD/YYYY");

    return date;
  }

  private isDateSameOrAfterToday(momentDate: Moment): boolean {
    const today = moment(new Date().toISOString());
    return momentDate.isSameOrAfter(today);
  }
}
