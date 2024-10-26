import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let apiKeyGuard: ApiKeyGuard;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    apiKeyGuard = new ApiKeyGuard(configService);
  });

  const mockContext = (headerApiKey?: string): Partial<ExecutionContext> =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': headerApiKey,
          },
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should throw an UnauthorizedException if no API key is provided', () => {
    expect(() => {
      apiKeyGuard.canActivate(mockContext() as ExecutionContext);
    }).toThrow(new UnauthorizedException('API key is required'));
  });

  it('should throw an UnauthorizedException if an invalid API key is provided', () => {
    jest.spyOn(configService, 'get').mockReturnValue('valid-api-key');
    expect(() => {
      apiKeyGuard.canActivate(
        mockContext('invalid-api-key') as ExecutionContext,
      );
    }).toThrow(new UnauthorizedException('Invalid API key'));
  });

  it('should allow access if the correct API key is provided', () => {
    jest.spyOn(configService, 'get').mockReturnValue('valid-api-key');
    const result = apiKeyGuard.canActivate(
      mockContext('valid-api-key') as ExecutionContext,
    );
    expect(result).toBe(true);
  });
});
