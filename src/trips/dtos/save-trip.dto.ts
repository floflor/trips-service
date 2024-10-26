import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID, Validate } from 'class-validator';
import { ITrip } from '../interfaces/trips.interface';
import { AirportCode } from '../enums/airport-code.enum';
import { NotMatchingIATA } from '../validators/not-matching-iata.validator';

export class SaveTripDto implements Partial<ITrip> {
  @ApiProperty({
    description: 'IATA 3 letter code of the origin',
    example: 'SYD',
    enum: AirportCode,
    required: true,
  })
  @IsEnum(AirportCode, {
    message: 'origin must be an available IATA code',
  })
  origin: AirportCode;

  @ApiProperty({
    description: 'IATA 3 letter code of the destination',
    example: 'GRU',
    enum: AirportCode,
    required: true,
  })
  @IsEnum(AirportCode, {
    message: 'destination must be an available IATA code',
  })
  @Validate(NotMatchingIATA, ['origin'])
  destination: AirportCode;

  @ApiProperty({
    description: 'Price of the trip',
    example: 20,
    required: true,
  })
  @IsNumber()
  cost: number;

  @ApiProperty({
    description: 'Duration of the trip',
    example: 5,
    required: true,
  })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Type of the trip',
    example: 'flight',
    required: true,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'ID of the trip',
    example: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
    required: true,
  })
  @IsUUID('4')
  apiId: string;

  @ApiProperty({
    description: 'Display name for the trip',
    example: 'from SYD to GRU by flight',
    required: true,
  })
  @IsString()
  display_name: string;
}
