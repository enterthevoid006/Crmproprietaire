import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../context/tenant-context';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            const token = authHeader.split(' ')[1];
            try {
                const decoded: any = jwt.decode(token);
                if (decoded && decoded.tenantId) {
                    // Wrap the next() call in the AsyncLocalStorage context
                    TenantContext.run(decoded.tenantId, next);
                    return;
                }
            } catch (e) {
                // Silent fail, let AuthGuard handle validity
            }
        }
        // If no token or no tenantId, proceed without context (UseCases will throw if they need it)
        next();
    }
}
