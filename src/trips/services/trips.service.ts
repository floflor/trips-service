import { HttpService } from '@nestjs/axios';
import { ConflictException, HttpException, Injectable } from '@nestjs/common';
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
          const filterMethod = this.sortByMap[sort_by];

          trips.sort((a, b) => {
            return a[filterMethod] - b[filterMethod];
          });

          return trips;
        }),
        catchError((error) => {
          const status = error.response?.status || 500;
          const message = error.response?.data?.msg || 'Internal server error';

          throw new HttpException(message, status);
        }),
      );
  }

  async listSavedTrips(): Promise<Trip[]> {
    return this.tripModel.find().exec();
  }

  async saveTrip(tripDto: SaveTripDto): Promise<Trip> {
    const existingTrip = await this.tripModel
      .findOne({ apiId: tripDto.apiId })
      .exec();

    if (existingTrip) {
      throw new ConflictException('a trip with this apiId already exists');
    }

    const newTrip = new this.tripModel(tripDto);
    return newTrip.save();
  }

  async deleteSavedTrip(id: string): Promise<Trip> {
    const objectId = new Types.ObjectId(id);
    return this.tripModel.findByIdAndDelete({ _id: objectId }).exec();
  }
}
