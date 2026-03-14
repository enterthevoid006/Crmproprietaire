import api from './api';

export interface TenantProfile {
    id: string;
    name: string;
    // Address
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    // Company identity
    companyName?: string | null;
    siret?: string | null;
    vatNumber?: string | null;
    // Contact
    phone?: string | null;
    email?: string | null;
    // Visual
    logoUrl?: string | null;
    // Billing settings
    paymentTerms?: string | null;
    quoteValidityDays?: number | null;
}

export const TenantService = {
    getProfile: async (): Promise<TenantProfile> => {
        const res = await api.get<TenantProfile>('/iam/tenant');
        return res.data;
    },

    updateProfile: async (data: Partial<Omit<TenantProfile, 'id'>>): Promise<TenantProfile> => {
        const res = await api.patch<TenantProfile>('/iam/tenant', data);
        return res.data;
    },
};
