import mongoose from 'mongoose';

class QueryBuilder {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    const queryObject = { ...this.queryObject };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);
    for (const field in queryObject) {
      const schemaType = this.query.model.schema.path(field);
      if (
        schemaType instanceof mongoose.Schema.Types.Array &&
        schemaType.caster instanceof mongoose.Schema.Types.String
      ) {
        const selections = queryObject[field].split(',');
        if (selections.length === 1) queryObject[field] = queryObject[field][0];
        else queryObject[field] = { in: selections };
      } else if (
        schemaType instanceof mongoose.Schema.Types.Array &&
        schemaType.caster instanceof mongoose.Schema.Types.Date
      ) {
        const [startDate, endDate] = queryObject[field].split(',');
        queryObject[field] = { gte: startDate, lte: endDate };
        console.log(queryObject);
      }
    }

    const filteredObj = JSON.parse(
      JSON.stringify(queryObject).replace(
        /\b(gte|gt|lte|lt|in)\b/g,
        (word) => `$${word}`
      )
    );

    this.query = this.query.find(filteredObj);
    return this;
  }

  sort() {
    this.query = this.query.sort(
      this.queryObject.sort?.split(',').join(' ') || '-createdAt'
    );
    return this;
  }

  selectFields() {
    this.query = this.query.select(
      this.queryObject.fields?.split(',').join(' ') || '-__v'
    );
    return this;
  }

  async paginate() {
    const page = this.queryObject.page || 1;
    const limit = this.queryObject.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.limit(limit).skip(skip);

    const totalDocs = await this.query.model.countDocuments(this.query);
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    this.pagination = {
      totalDocs,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    };

    return this;
  }
}

export default QueryBuilder;
