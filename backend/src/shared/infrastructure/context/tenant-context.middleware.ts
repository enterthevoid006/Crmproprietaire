import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from './tenant-context';
import { decode } from 'jsonwebtoken';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        let tenantId;

        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            const token = authHeader.split(' ')[1];
            try {
                const payload: any = decode(token);
                if (payload && payload.tenantId) {
                    tenantId = payload.tenantId;
                }
            } catch (e) {
                // Token invalid, ignore context population (Guard will fail later if needed)
            }
        }

        if (tenantId) {
            TenantContext.run(tenantId, () => {
                next();
            });
        } else {
            next();
        }
    }
}
