import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { Actor, ActorType } from '../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../domain/ports/actor.repository.port';
import type { ActorRepositoryPort } from '../../domain/ports/actor.repository.port';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';

const MAX_ROWS = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ImportCsvResult {
    imported: number;
    skipped: number;
    errors: { line: number; reason: string }[];
}

@Injectable()
export class ImportCsvUseCase {
    constructor(
        @Inject(ACTOR_REPOSITORY) private actorRepo: ActorRepositoryPort,
    ) {}

    async execute(fileBuffer: Buffer): Promise<ImportCsvResult> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        let rows: Record<string, string>[];
        try {
            rows = parse(fileBuffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true,
            }) as Record<string, string>[];
        } catch {
            throw new Error('Le fichier CSV est invalide ou mal formaté.');
        }

        if (rows.length > MAX_ROWS) {
            throw new Error(`Le fichier dépasse la limite de ${MAX_ROWS} lignes.`);
        }

        const result: ImportCsvResult = { imported: 0, skipped: 0, errors: [] };

        for (let i = 0; i < rows.length; i++) {
            const lineNum = i + 2; // +2 because line 1 is the header
            const row = rows[i];

            // Resolve type
            const rawType = (row.type || '').toUpperCase();
            const actorType: ActorType =
                rawType === 'CORPORATE' ? ActorType.CORPORATE : ActorType.INDIVIDUAL;

            // Validate email
            if (row.email && !EMAIL_RE.test(row.email)) {
                result.errors.push({ line: lineNum, reason: `Email invalide : "${row.email}"` });
                result.skipped++;
                continue;
            }

            // Validate name fields
            if (actorType === ActorType.INDIVIDUAL && !row.firstName && !row.lastName) {
                result.errors.push({ line: lineNum, reason: 'firstName ou lastName requis pour un particulier' });
                result.skipped++;
                continue;
            }
            if (actorType === ActorType.CORPORATE && !row.companyName) {
                result.errors.push({ line: lineNum, reason: 'companyName requis pour une entreprise' });
                result.skipped++;
                continue;
            }

            // Parse tags (comma-separated)
            const tags = row.tags
                ? row.tags.split(',').map(t => t.trim()).filter(Boolean)
                : [];

            try {
                const actor = Actor.create({
                    tenantId,
                    type: actorType,
                    firstName: row.firstName || undefined,
                    lastName: row.lastName || undefined,
                    companyName: row.companyName || undefined,
                    email: row.email || undefined,
                    phone: row.phone || undefined,
                    address: row.address || undefined,
                    tags,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await this.actorRepo.save(actor);
                result.imported++;
            } catch (err: any) {
                result.errors.push({ line: lineNum, reason: err?.message ?? 'Erreur inconnue' });
                result.skipped++;
            }
        }

        return result;
    }
}
