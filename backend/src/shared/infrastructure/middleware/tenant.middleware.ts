import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../context/tenant-context';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            const token = authHeader.split(' ')[1];
            try {
                const secret = this.configService.get<string>('JWT_SECRET')!;
                const decoded: any = jwt.verify(token, secret);
                if (decoded && decoded.tenantId) {
                    TenantContext.run(decoded.tenantId, next);
                    return;
                }
            } catch (e) {
                // Invalid or expired token — let AuthGuard handle the rejection
            }
        }
        next();
    }
}
