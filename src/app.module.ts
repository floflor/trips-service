import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [ConfigModule.forRoot(), TripsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
