import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AirportCode } from '../enums/airport-code.enum';
import { SortBy } from '../enums/sort-type.enum';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { TripsService } from '../services/trips.service';
import { TripController } from './trips.controller';
import { SaveTripDto } from '../dtos/save-trip.dto';

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

  const mockSavedTrips = [
    {
      _id: 'saved-trip-1',
      apiId: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
      origin: AirportCode.SYD,
      destination: AirportCode.GRU,
      duration: 5,
      cost: 20,
      type: 'flight',
      display_name: 'from SYD to GRU by flight',
    },
    {
      _id: 'saved-trip-2',
      apiId: 'b849c866-7928-4d08-9d5c-a6821a583d1b',
      origin: AirportCode.CDG,
      destination: AirportCode.BCN,
      duration: 2,
      cost: 50,
      type: 'flight',
      display_name: 'from CDG to BCN by flight',
    },
  ];

  const mockTripsService = {
    search: jest.fn(),
    saveTrip: jest.fn(),
    listSavedTrips: jest.fn(),
    deleteSavedTrip: jest.fn(),
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

  describe('listSavedTrips', () => {
    it('should return all saved trips', async () => {
      mockTripsService.listSavedTrips.mockResolvedValue(mockSavedTrips);

      const result = await controller.listSavedTrips();

      expect(result).toEqual(mockSavedTrips);
      expect(tripsService.listSavedTrips).toHaveBeenCalled();
    });
  });

  describe('saveTrip', () => {
    it('should successfully save a new trip', async () => {
      const newTripDto: SaveTripDto = {
        apiId: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
        origin: AirportCode.SYD,
        destination: AirportCode.GRU,
        duration: 5,
        cost: 20,
        type: 'flight',
        display_name: 'from SYD to GRU by flight',
      };

      const savedTrip = { ...newTripDto, _id: 'new-trip-id' };
      mockTripsService.saveTrip.mockResolvedValue(savedTrip);

      const result = await controller.saveTrip(newTripDto);

      expect(result).toEqual(savedTrip);
      expect(tripsService.saveTrip).toHaveBeenCalledWith(newTripDto);
    });

    it('should throw an error when saving a trip with invalid data', async () => {
      const invalidTripDto = {
        apiId: 'invalid-uuid',
        origin: 'INVALID' as AirportCode,
        destination: AirportCode.GRU,
        duration: 5,
        cost: 20,
        type: 'flight',
        display_name: 'from INVALID to GRU by flight',
      };

      mockTripsService.saveTrip.mockRejectedValue(
        new Error('Invalid input data'),
      );

      await expect(
        controller.saveTrip(invalidTripDto as SaveTripDto),
      ).rejects.toThrow('Invalid input data');
    });
  });

  describe('deleteSavedTrip', () => {
    it('should successfully delete a saved trip', async () => {
      const tripId = 'saved-trip-1';
      const deletedTrip = mockSavedTrips[0];

      mockTripsService.deleteSavedTrip.mockResolvedValue(deletedTrip);

      const result = await controller.deleteSavedTrip(tripId);

      expect(result).toEqual(deletedTrip);
      expect(tripsService.deleteSavedTrip).toHaveBeenCalledWith(tripId);
    });

    it('should throw an error when deleting a non-existent trip', async () => {
      const nonExistentTripId = 'non-existent-id';

      mockTripsService.deleteSavedTrip.mockRejectedValue(
        new Error('Trip not found'),
      );

      await expect(
        controller.deleteSavedTrip(nonExistentTripId),
      ).rejects.toThrow('Trip not found');
    });
  });
});
