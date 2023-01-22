import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ForceHttpsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const xForwardedProto = req.header('x-forwarded-proto');
    if (
      (!xForwardedProto || xForwardedProto !== 'https') &&
      process.env.FORCE_HTTPS &&
      process.env.FORCE_HTTPS === 'true'
    ) {
      res.redirect('https://' + req.header('host') + req.originalUrl);
      return;
    }
    next();
  }
}
