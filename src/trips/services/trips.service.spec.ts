import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TripsService } from './trips.service';
import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { SortBy } from '../enums/sort-type.enum';
import { AirportCode } from '../enums/airport-code.enum';

describe('Trips Service', () => {
  let service: TripsService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockTrips = [
    {
      id: 1,
      origin: AirportCode.BCN,
      destination: AirportCode.MAD,
      duration: 3,
      cost: 20,
    },
    {
      id: 2,
      origin: AirportCode.BCN,
      destination: AirportCode.MAD,
      duration: 1,
      cost: 90,
    },
    {
      id: 3,
      origin: AirportCode.BCN,
      destination: AirportCode.MAD,
      duration: 2,
      cost: 50,
    },
  ];

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'API_URL':
          return 'http://mock-api.com';
        case 'API_KEY':
          return 'mock-api-key';
        default:
          return null;
      }
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    const searchParams = {
      origin: AirportCode.BCN,
      destination: AirportCode.MAD,
      sort_by: SortBy.FASTEST,
    };

    it('should make HTTP request with correct parameters', (done) => {
      mockHttpService.get.mockReturnValue(
        of({
          data: mockTrips,
        }),
      );

      service.search(searchParams).subscribe(() => {
        expect(httpService.get).toHaveBeenCalledWith('http://mock-api.com', {
          headers: { 'x-api-key': 'mock-api-key' },
          params: {
            origin: AirportCode.BCN,
            destination: AirportCode.MAD,
          },
        });
        done();
      });
    });

    it('should sort trips by duration when sort_by is FASTEST', (done) => {
      mockHttpService.get.mockReturnValue(
        of({
          data: mockTrips,
        }),
      );

      service.search(searchParams).subscribe((result) => {
        expect(result[0].duration).toBe(1);
        expect(result[1].duration).toBe(2);
        expect(result[2].duration).toBe(3);
        done();
      });
    });

    it('should sort trips by cost when sort_by is CHEAPEST', (done) => {
      mockHttpService.get.mockReturnValue(
        of({
          data: mockTrips,
        }),
      );

      service
        .search({ ...searchParams, sort_by: SortBy.CHEAPEST })
        .subscribe((result) => {
          expect(result[0].cost).toBe(20);
          expect(result[1].cost).toBe(50);
          expect(result[2].cost).toBe(90);
          done();
        });
    });

    it('should handle API errors correctly', (done) => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            msg: 'Error: Missing origin or destination query params',
          },
        },
      };

      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      service.search(searchParams).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(400);
          expect(error.message).toBe(
            'Error: Missing origin or destination query params',
          );
          done();
        },
      });
    });

    it('should handle unknown errors with 500 status', (done) => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error()));

      service.search(searchParams).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(500);
          expect(error.message).toBe('Internal server error');
          done();
        },
      });
    });
  });
});
