import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trips.controller';
import { TripsService } from '../services/trips.service';
import { of } from 'rxjs';
import { SortBy } from '../enums/sort-type.enum';
import { AirportCode } from '../enums/airport-code.enum';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from '../guards/api-key.guard';

describe('Trip Controller', () => {
  let controller: TripController;
  let tripsService: TripsService;
  let configService: ConfigService;

  const mockTrips = [
    {
      id: 1,
      origin: AirportCode.CDG,
      destination: AirportCode.BCN,
      duration: 1,
      cost: 80,
    },
    {
      id: 2,
      origin: AirportCode.CDG,
      destination: AirportCode.BCN,
      duration: 2,
      cost: 50,
    },
  ];

  const mockTripsService = {
    search: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        ApiKeyGuard,
      ],
    }).compile();

    controller = module.get<TripController>(TripController);
    tripsService = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTrips', () => {
    it('should return trips', (done) => {
      const queryParams = {
        origin: AirportCode.CDG,
        destination: AirportCode.BCN,
        sort_by: SortBy.FASTEST,
      };

      mockTripsService.search.mockReturnValue(of(mockTrips));

      controller.getTrips(queryParams).subscribe((result) => {
        expect(result).toEqual(mockTrips);
        expect(tripsService.search).toHaveBeenCalledWith(queryParams);
        done();
      });
    });
  });
});
