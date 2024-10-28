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
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { ITrip } from '../interfaces/trips.interface';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { GetTripsDto } from '../dtos/get-trips.dto';
import { Observable } from 'rxjs';
import { Trip } from '../schemas/trip.schema';
import { SaveTripDto } from '../dtos/save-trip.dto';
import { GetSavedTripsDto } from '../dtos/get-saved-trips.dto';

const API_TAGS = 'trips';

@ApiTags(API_TAGS)
@Controller('trips')
@UseGuards(ApiKeyGuard)
@ApiSecurity('api_key')
@ApiResponse({ status: 500, description: 'Internal server error.' })
export class TripController {
  constructor(private readonly tripService: TripsService) {}

  @ApiOperation({
    summary: 'Retrieve available trips based on search and sort criteria',
  })
  @ApiResponse({
    status: 200,
    description: 'Trips successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Invalid search parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - API key required.' })
  @Get()
  getTrips(@Query() getTripsDto: GetTripsDto): Observable<ITrip[]> {
    return this.tripService.search(getTripsDto);
  }

  @ApiOperation({ summary: 'List all saved trips' })
  @ApiResponse({
    status: 200,
    description: 'List of saved trips retrieved.',
  })
  @Get('saved')
  async listSavedTrips(
    @Query() getSavedTripsDto: GetSavedTripsDto,
  ): Promise<Trip[]> {
    return this.tripService.listSavedTrips(getSavedTripsDto);
  }

  @ApiOperation({ summary: 'Save a new trip' })
  @ApiResponse({
    status: 201,
    description: 'Trip successfully saved.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 409,
    description: 'Trip with the given apiId already exists.',
  })
  @Post('saved')
  async saveTrip(@Body() tripDto: SaveTripDto): Promise<Trip> {
    return this.tripService.saveTrip(tripDto);
  }

  @ApiOperation({ summary: 'Delete a saved trip by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the trip to delete',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Trip successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Trip not found.' })
  @Delete('saved/:id')
  async deleteSavedTrip(@Param('id') id: string): Promise<Trip> {
    return this.tripService.deleteSavedTrip(id);
  }
}
