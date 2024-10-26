import { ValidationArguments } from 'class-validator';
import { AirportCode } from '../enums/airport-code.enum';
import { NotMatchingIATA } from './not-matching-iata.validator';

describe('Not Matching IATA Validator', () => {
  let validator: NotMatchingIATA;

  const mockArgs = {
    object: {
      origin: AirportCode.BCN,
    },
  } as unknown as ValidationArguments;

  beforeEach(() => {
    validator = new NotMatchingIATA();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  it('should return false when matching destination and origin', () => {
    const result = validator.validate(AirportCode.BCN, mockArgs);
    expect(result).toBeFalsy;
  });

  it('should return true when not matching destination and origin', () => {
    const result = validator.validate(AirportCode.MAD, mockArgs);
    expect(result).toBeTruthy();
  });

  it('should return the correct default message', () => {
    const message = validator.defaultMessage(mockArgs);
    expect(message).toBe('origin and destination cannot be the same');
  });
});
