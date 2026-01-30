import { AsyncLocalStorage } from 'async_hooks';

export class TenantContext {
    private static storage = new AsyncLocalStorage<string>();

    static run(tenantId: string, callback: () => void) {
        this.storage.run(tenantId, callback);
    }

    static getTenantId(): string | undefined {
        return this.storage.getStore();
    }

    static getTenantIdOrThrow(): string {
        const tenantId = this.getTenantId();
        if (!tenantId) {
            throw new Error('TenantContext: Tenant ID used outside of context');
        }
        return tenantId;
    }
}
