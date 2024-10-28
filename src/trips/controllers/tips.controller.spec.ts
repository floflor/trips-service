import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { SaveTripDto } from '../dtos/save-trip.dto';
import { AirportCode } from '../enums/airport-code.enum';
import { SortBy } from '../enums/sort-type.enum';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { TripsService } from '../services/trips.service';
import { TripController } from './trips.controller';

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

    jest.clearAllMocks();
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
    beforeEach(() => {
      mockTripsService.listSavedTrips.mockResolvedValue(mockSavedTrips);
    });

    it('should retrieve all saved trips', async () => {
      const result = await controller.listSavedTrips({});

      expect(result).toEqual(mockSavedTrips);
      expect(mockTripsService.listSavedTrips).toHaveBeenCalledWith({});
    });

    it('should filter trips by origin and destination', async () => {
      const filteredTrips = [mockSavedTrips[1]];
      mockTripsService.listSavedTrips.mockResolvedValue(filteredTrips);

      const result = await controller.listSavedTrips({
        origin: AirportCode.CDG,
        destination: AirportCode.BCN,
      });

      expect(result).toEqual(filteredTrips);
      expect(mockTripsService.listSavedTrips).toHaveBeenCalledWith({
        origin: AirportCode.CDG,
        destination: AirportCode.BCN,
      });
    });

    it('should sort trips by cost when sort_by is CHEAPEST', async () => {
      const sortedTrips = [...mockSavedTrips].sort((a, b) => a.cost - b.cost);
      mockTripsService.listSavedTrips.mockResolvedValue(sortedTrips);

      const result = await controller.listSavedTrips({
        sort_by: SortBy.CHEAPEST,
      });

      expect(result[0]).toEqual(mockSavedTrips[0]);
      expect(mockTripsService.listSavedTrips).toHaveBeenCalledWith({
        sort_by: SortBy.CHEAPEST,
      });
    });

    it('should sort trips by duration when sort_by is FASTEST', async () => {
      const sortedByDuration = [...mockSavedTrips].sort(
        (a, b) => a.duration - b.duration,
      );
      mockTripsService.listSavedTrips.mockResolvedValue(sortedByDuration);

      const result = await controller.listSavedTrips({
        sort_by: SortBy.FASTEST,
      });

      expect(result[0]).toEqual(mockSavedTrips[1]);
      expect(result).toEqual(sortedByDuration);
      expect(mockTripsService.listSavedTrips).toHaveBeenCalledWith({
        sort_by: SortBy.FASTEST,
      });
    });
  });

  describe('saveTrip', () => {
    it('should successfully save a new trip', async () => {
      const newTripDto: SaveTripDto = mockSavedTrips[0];
      const savedTrip = { ...newTripDto };

      mockTripsService.saveTrip.mockResolvedValue(savedTrip);

      const result = await controller.saveTrip(newTripDto);

      expect(result).toEqual(savedTrip);
      expect(tripsService.saveTrip).toHaveBeenCalledWith(newTripDto);
    });

    it('should throw an error when saving a trip with invalid data', async () => {
      const invalidTripDto = {
        ...mockSavedTrips[0],
        apiId: 'invalid-uuid',
        origin: 'INVALID' as AirportCode,
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
      const tripToDelete = mockSavedTrips[0];
      mockTripsService.deleteSavedTrip.mockResolvedValue(tripToDelete);

      const result = await controller.deleteSavedTrip(tripToDelete._id);

      expect(result).toEqual(tripToDelete);
      expect(tripsService.deleteSavedTrip).toHaveBeenCalledWith(
        tripToDelete._id,
      );
    });

    it('should throw an error when deleting a non-existent trip', async () => {
      mockTripsService.deleteSavedTrip.mockRejectedValue(
        new Error('Trip not found'),
      );

      await expect(
        controller.deleteSavedTrip('non-existent-id'),
      ).rejects.toThrow('Trip not found');
    });
  });
});
