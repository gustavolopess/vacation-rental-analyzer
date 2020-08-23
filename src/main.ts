import puppeteer from "puppeteer";
import { AirbnbCrawlerProvider } from "./providers/implementations/AirbnbCrawlerProvider";
import { ComputeUnavailableDaysByRoomAndMonthUseCase } from "./useCases/airbnb/computeUnavailableDaysByRoomAndMonth/ComputeUnavailableDaysByRoomAndMonthUseCase";
import { JsonFileUnavailableDaysRepository } from "./repositories/implementations/JsonFileUnavailableDaysRepository";

const listAirbnbRoomsUnavailableDays = async () => {
  const roomIds = (<string>process.env.AIRBNB_ROOM_IDS).split(",");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const airbnbCrawlerProvider = new AirbnbCrawlerProvider(browser);

  const jsonUnavailableDaysRepository = new JsonFileUnavailableDaysRepository(
    <string>process.env.UNAVAILABLE_DAYS_JSON_PATH
  );

  const computeUnavailableDaysUseCase = new ComputeUnavailableDaysByRoomAndMonthUseCase(
    airbnbCrawlerProvider,
    jsonUnavailableDaysRepository
  );

  await computeUnavailableDaysUseCase.execute(roomIds);

  process.exit(0);
};

void listAirbnbRoomsUnavailableDays();
