import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { catchError, map, Observable } from 'rxjs';
import { GetTripsDto } from '../dtos/get-trips.dto';
import { ITrip } from '../interfaces/trips.interface';
import { SortBy } from '../enums/sort-type.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Trip, TripDocument } from '../schemas/trip.schema';
import { Model, Types } from 'mongoose';
import { SaveTripDto } from '../dtos/save-trip.dto';
import { GetSavedTripsDto } from '../dtos/get-saved-trips.dto';

@Injectable()
export class TripsService {
  private readonly sortByMap = {
    [SortBy.FASTEST]: 'duration',
    [SortBy.CHEAPEST]: 'cost',
  };
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private sortTrips<T extends { duration: number; cost: number }>(
    trips: T[],
    sort_by: SortBy,
  ) {
    const sortMethod = this.sortByMap[sort_by];
    return trips.sort((a, b) => {
      return a[sortMethod] - b[sortMethod];
    });
  }

  search(getTripsDto: GetTripsDto): Observable<ITrip[]> {
    const { origin, destination, sort_by } = getTripsDto;
    const searchUrl = this.configService.get('API_URL');

    return this.httpService
      .get(searchUrl, {
        headers: { 'x-api-key': this.configService.get('API_KEY') },
        params: {
          origin,
          destination,
        },
      })
      .pipe(
        map((response: AxiosResponse<ITrip[]>) => {
          let trips = response.data;
          return this.sortTrips(trips, sort_by);
        }),
        catchError((error) => {
          const status = error.response?.status || 500;
          const message = error.response?.data?.msg || 'Internal server error';

          throw new HttpException(message, status);
        }),
      );
  }

  async listSavedTrips(getSavedTripsDto: GetSavedTripsDto): Promise<Trip[]> {
    const { origin, destination, sort_by } = getSavedTripsDto;
    const filter: Record<string, any> = {};

    if (origin && destination) {
      filter.origin = origin;
      filter.destination = destination;
    }

    const savedTrips = await this.tripModel.find(filter);

    if (sort_by) {
      return this.sortTrips(savedTrips, sort_by);
    }
    return savedTrips;
  }

  async saveTrip(tripDto: SaveTripDto): Promise<Trip> {
    const existingTrip = await this.tripModel
      .findOne({ apiId: tripDto.apiId })
      .exec();

    if (existingTrip) {
      throw new ConflictException('a trip with this apiId already exists');
    }

    return this.tripModel.create(tripDto);
  }

  async deleteSavedTrip(id: string): Promise<Trip> {
    const deletedTrip = await this.tripModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedTrip) {
      throw new NotFoundException('trip not found');
    }

    return deletedTrip;
  }
}
