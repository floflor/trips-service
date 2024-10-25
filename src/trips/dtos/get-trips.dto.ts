import { ApiProperty } from '@nestjs/swagger';
import { ITrip } from '../interfaces/trips.interface';
import { IsEnum, IsString, Validate } from 'class-validator';
import { SortBy } from '../enums/sort-type.enum';
import { AirportCode } from '../enums/airport-code.enum';
import { NotMatchingIATA } from '../validators/not-matching-iata.validator';

export class GetTripsDto implements Partial<ITrip> {
  @ApiProperty({
    description: 'IATA 3 letter code of the origin',
    example: 'SYD',
    required: true,
  })
  @IsEnum(AirportCode, {
    message: 'origin must be an available IATA code',
  })
  origin: AirportCode;

  @ApiProperty({
    description: 'IATA 3 letter code of the destination',
    example: 'GRU',
    required: true,
  })
  @IsEnum(AirportCode, {
    message: 'destintation must be an available IATA code',
  })
  @Validate(NotMatchingIATA, ['origin'])
  destination: AirportCode;

  @ApiProperty({
    description: 'The sorting method, can be "cheapest" or "fastest"',
    example: 'fastest',
    required: true,
  })
  @IsEnum(SortBy, {
    message: 'sort_by must be either "fastest" or "cheapest"',
  })
  sort_by: SortBy;
}
