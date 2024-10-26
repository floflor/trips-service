import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from '../services/trips.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ITrip } from '../interfaces/trips.interface';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { GetTripsDto } from '../dtos/get-trips.dto';
import { Observable } from 'rxjs';
import { Trip } from '../schemas/trip.schema';
import { SaveTripDto } from '../dtos/save-trip.dto';

const API_TAGS = 'trips';

@ApiTags(API_TAGS)
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripsService) {}

  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api_key')
  @Get()
  getTrips(@Query() getTripsDto: GetTripsDto): Observable<ITrip[]> {
    return this.tripService.search(getTripsDto);
  }

  @Get('saved')
  async listSavedTrips(): Promise<Trip[]> {
    return this.tripService.listSavedTrips();
  }

  @Post()
  async saveTrip(@Body() tripDto: SaveTripDto): Promise<Trip> {
    return this.tripService.saveTrip(tripDto);
  }

  @Delete('saved/:id')
  async deleteSavedTrip(@Param('id') id: string): Promise<Trip> {
    return this.tripService.deleteSavedTrip(id);
  }
}
