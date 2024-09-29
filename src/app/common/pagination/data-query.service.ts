import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ObjectLiteral, Repository, Brackets } from 'typeorm';
import { IPagination } from './pagination.interface';
import { PaginationQueryDto } from './dto/data-query.dto';

@Injectable()
export class DataQueryService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async dataQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    searchableFields: string[],
    repository: Repository<T>,
  ): Promise<IPagination<T>> {
    const { page = 1, limit = 10, search, filters } = paginationQuery;

    const queryBuilder = repository.createQueryBuilder('entity');

    // Add dynamic filters (AND conditions)
    if (filters && Object.keys(filters).length > 0) {
      for (const [field, value] of Object.entries(filters)) {
        queryBuilder.andWhere(`entity.${field} = :${field}`, {
          [field]: value,
        });
      }
    }

    // Add search logic (OR conditions)
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          searchableFields.forEach((field, index) => {
            qb.orWhere(`entity.${field} LIKE :search`, {
              search: `%${search}%`,
            });
          });
        }),
      );
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const [results, total] = await queryBuilder.getManyAndCount();

    // Pagination meta and links
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    const baseUrl = `${this.request.protocol}://${this.request.headers.host}/`;
    const newUrl = new URL(this.request.url, baseUrl);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages,
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
  }
}
