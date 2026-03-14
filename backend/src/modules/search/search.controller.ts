import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../iam/infrastructure/authentication/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get()
    async search(@Query('q') q: string) {
        if (!q || q.trim().length < 2) {
            throw new BadRequestException('Le terme de recherche doit contenir au moins 2 caractères.');
        }
        return this.searchService.search(q);
    }
}
