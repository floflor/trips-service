import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema()
export class Trip {
  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  display_name: string;

  @Prop({ required: true, index: true })
  apiId: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
