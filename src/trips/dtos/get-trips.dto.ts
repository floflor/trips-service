import { ApiProperty } from '@nestjs/swagger';
import { ITrip } from '../interfaces/trips.interface';
import { IsEnum, IsString } from 'class-validator';
import { SortBy } from '../enums/sort-type.enum';

export class GetTripsDto implements Partial<ITrip> {
  @ApiProperty({
    description: 'IATA 3 letter code of the origin',
    example: 'SYD',
    required: true,
  })
  @IsString()
  origin: string;

  @ApiProperty({
    description: 'IATA 3 letter code of the destination',
    example: 'GRU',
    required: true,
  })
  @IsString()
  destination: string;

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
