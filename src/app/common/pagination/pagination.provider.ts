import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ObjectLiteral, Repository, FindOptionsWhere, Like } from 'typeorm';
import { PaginationQueryDto } from './pagination-query.dto';
import { IPagination } from './pagination.interface';

@Injectable()
export class PaginationProvider {
  constructor(
    /**
     * Inject Request
     */
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  // Service Function starts here
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<IPagination<T>> {
    const { page = 1, limit = 10, search, filters } = paginationQuery;

    // Dynamic where conditions
    const whereConditions: any[] = [];

    // Add dynamic filters
    if (filters && Object.keys(filters).length > 0) {
      for (const [field, value] of Object.entries(filters)) {
        whereConditions.push({ [field]: value });
      }
    }

    // Add search logic
    if (search) {
      const searchableFields = ['name', 'role'];
      const searchConditions = searchableFields.map((field) => ({
        [field]: Like(`%${search}%`),
      }));
      // Combine search conditions with filters using OR
      whereConditions.push(...searchConditions);
    }

    console.log(whereConditions); // Debugging line

    // Fetch paginated data with dynamic where conditions
    const [results, total] = await repository.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate the page numbers
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    // Create pagination links
    const baseUrl = `${this.request.protocol}://${this.request.headers.host}/`;
    const newUrl = new URL(this.request.url, baseUrl);

    const finalResponse: IPagination<T> = {
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${page}`,
        next: nextPage
          ? `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`
          : null,
        previous: previousPage
          ? `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`
          : null,
      },
      data: results,
    };

    return finalResponse;
  }
}
