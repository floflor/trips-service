import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AirportCode } from '../enums/airport-code.enum';

@ValidatorConstraint({ name: 'notMatchingIata', async: false })
export class NotMatchingIATA implements ValidatorConstraintInterface {
  validate(destination: AirportCode, args: ValidationArguments) {
    const origin = (args.object as any).origin;
    return origin !== destination;
  }

  defaultMessage(args: ValidationArguments) {
    return 'origin and destination cannot be the same';
  }
}
