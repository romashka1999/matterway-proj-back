import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get-all-genres')
  getAllGenres() {
    return this.appService.getAllGenres();
  }

  @Get('get-best-book/:genre')
  getBestBook(@Param('genre') genre: string) {
    return this.appService.getBestBook(genre);
  }

  @Get('get-checkout-screen/:book')
  getCheckoutScreenOfBook(@Param('book') book: string) {
    return this.appService.getCheckoutScreenOfBook(book);
  }
}
