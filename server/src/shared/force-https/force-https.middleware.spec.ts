import { ForceHttpsMiddleware } from './force-https.middleware';

describe('ForceHttpsMiddleware', () => {
  it('should be defined', () => {
    expect(new ForceHttpsMiddleware()).toBeDefined();
  });
});
