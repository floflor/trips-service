import { Module } from '@nestjs/common';
import { TripController } from './controllers/trips.controller';
import { TripsService } from './services/trips.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TripController],
  providers: [TripsService],
})
export class TripsModule {}
