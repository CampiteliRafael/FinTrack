export class QueryOptimizer {
  static paginationDefaults = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  };

  static getPagination(page?: number, limit?: number) {
    const safePage = Math.max(page || this.paginationDefaults.defaultPage, 1);
    const safeLimit = Math.min(
      Math.max(limit || this.paginationDefaults.defaultLimit, 1),
      this.paginationDefaults.maxLimit
    );

    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      page: safePage,
      limit: safeLimit,
    };
  }

  static selectFields<T>(fields: (keyof T)[]): Record<string, boolean> {
    return fields.reduce(
      (acc, field) => {
        acc[field as string] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }

  static buildDateRangeFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return undefined;

    const filter: any = {};

    if (startDate) {
      filter.gte = startDate;
    }

    if (endDate) {
      filter.lte = endDate;
    }

    return filter;
  }

  static softDeleteFilter(includeDeleted = false) {
    return includeDeleted ? undefined : { deletedAt: null };
  }
}
