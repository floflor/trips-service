import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { of, throwError } from 'rxjs';
import { AirportCode } from '../enums/airport-code.enum';
import { SortBy } from '../enums/sort-type.enum';
import { Trip } from '../schemas/trip.schema';
import { TripsService } from './trips.service';
import { exec } from 'child_process';

describe('Trips Service', () => {
  let service: TripsService;
  let httpService: HttpService;
  let configService: ConfigService;
  let tripModel: Model<Trip>;

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

  const mockSavedTrips = [
    {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
      apiId: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
      origin: AirportCode.SYD,
      destination: AirportCode.GRU,
      duration: 5,
      cost: 20,
      type: 'flight',
      display_name: 'from SYD to GRU by flight',
    },
    {
      _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
      apiId: 'b849c866-7928-4d08-9d5c-a6821a583d1b',
      origin: AirportCode.CDG,
      destination: AirportCode.BCN,
      duration: 2,
      cost: 50,
      type: 'flight',
      display_name: 'from CDG to BCN by flight',
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

  const mockTripModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
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
        {
          provide: getModelToken(Trip.name),
          useValue: mockTripModel,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    tripModel = module.get<Model<Trip>>(getModelToken(Trip.name));
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

  describe('listSavedTrips', () => {
    it('should successfully list all the trips saved', async () => {
      mockTripModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSavedTrips),
      });

      const result = await service.listSavedTrips();

      expect(result).toEqual(mockSavedTrips);
    });
  });

  describe('saveTrip', () => {
    const newTripDto = {
      apiId: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
      origin: AirportCode.SYD,
      destination: AirportCode.GRU,
      duration: 5,
      cost: 20,
      type: 'flight',
      display_name: 'from SYD to GRU by flight',
    };

    it('should successfully save a new trip', async () => {
      mockTripModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const savedTrip = { ...newTripDto, _id: new Types.ObjectId() };
      mockTripModel.create.mockResolvedValue(savedTrip);

      const result = await service.saveTrip(newTripDto);

      expect(result).toEqual(savedTrip);
      expect(mockTripModel.findOne).toHaveBeenCalledWith({
        apiId: newTripDto.apiId,
      });
      expect(mockTripModel.create).toHaveBeenCalledWith(newTripDto);
    });

    it('should throw ConflictException when trip with same apiId exists', async () => {
      mockTripModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSavedTrips[0]),
      });

      await expect(service.saveTrip(newTripDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTripModel.findOne).toHaveBeenCalledWith({
        apiId: newTripDto.apiId,
      });
    });
  });

  describe('deleteSavedTrip', () => {
    it('should successfully delete a saved trip', async () => {
      const tripId = '507f1f77bcf86cd799439011';
      const deletedTrip = mockSavedTrips[0];

      mockTripModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedTrip),
      });

      const result = await service.deleteSavedTrip(tripId);

      expect(result).toEqual(deletedTrip);
      expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(
        new Types.ObjectId(tripId),
      );
    });

    it('should throw NotFoundException when trip does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439099';

      mockTripModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.deleteSavedTrip(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(
        new Types.ObjectId(nonExistentId),
      );
    });
  });
});
