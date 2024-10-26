import { Module } from '@nestjs/common';
import { TripController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotMatchingIATA } from './validators/not-matching-iata.validator';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  controllers: [TripController],
  providers: [TripsService, NotMatchingIATA],
})
export class TripsModule {}
