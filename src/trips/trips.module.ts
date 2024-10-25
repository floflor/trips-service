import { Module } from '@nestjs/common';
import { TripController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotMatchingIATA } from './validators/not-matching-iata.validator';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TripController],
  providers: [TripsService, NotMatchingIATA],
})
export class TripsModule {}
