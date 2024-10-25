import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { catchError, map, Observable } from 'rxjs';
import { GetTripsDto } from '../dtos/get-trips.dto';
import { ITrip } from '../interfaces/trips.interface';
import { SortBy } from '../enums/sort-type.enum';

@Injectable()
export class TripsService {
  private readonly sortByMap = {
    [SortBy.FASTEST]: 'duration',
    [SortBy.CHEAPEST]: 'cost',
  };
  constructor(
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
}
