import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { Observable } from 'rxjs'; // Fix for Observable usage

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const parentCanActivate = super.canActivate(context);

        // If super returns promise/boolean (most cases in NestJS auth)
        if (parentCanActivate instanceof Promise) {
            return parentCanActivate.then((allowed) => {
                if (allowed) {
                    const request = context.switchToHttp().getRequest();
                    const user = request.user;
                    // Populate Context!
                    if (user && user.tenantId) {
                        // We can't easily "wrap" the entire downstream request in ALS.run() here 
                        // because canActivate is just a boolean check, not a middleware.
                        // HOWEVER, AsyncLocalStorage can work if we set it in a Middleware...
                        // OR, we assume we are inside a Request Scope where we can set the store?
                        // No, ALS works by wrapping the callback.

                        // CRITICAL: NestJS Guards run BEFORE the handler, but they don't wrap the handler execution in a callback efficiently.
                        // The canonical way to use ALS in NestJS is a MIDDLEWARE.
                        // But the middleware happens BEFORE the Guard.
                        // And we need the JWT payload (user) to know the tenantId.

                        // Dilemma: We need to decode the token to get the tenantId to set the ALS, 
                        // but `AuthGuard` does the decoding.

                        // Solution: Use a custom Middleware that decodes the JWT *optimistically* just to get the tenantId 
                        // and wraps the `next()` call in `TenantContext.run()`.
                        // Then the Guard performs the actual security check (signature verification, expiration).
                        // OR: Use strict `TenantContext` in middleware.

                        return true;
                    }
                }
                return allowed;
            });
        }

        // Since converting Guard to Middleware wrapper is hard, we will create a dedicated TenantMiddleware.
        return parentCanActivate;
    }
}
