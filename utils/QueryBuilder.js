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

    for (const key in queryObject) {
      const fieldSchemaType = this.query.model.schema.path(key);
      const mongooseSchemaTypes = mongoose.Schema.Types;

      const schemaTypeArray =
        fieldSchemaType instanceof mongooseSchemaTypes.Array;
      const schemaTypeString =
        fieldSchemaType instanceof mongooseSchemaTypes.String;
      const schemaTypeNumber =
        fieldSchemaType instanceof mongooseSchemaTypes.Number;
      const schemaTypeDate =
        fieldSchemaType instanceof mongooseSchemaTypes.Date;

      const schemaTypeArrayOfDates =
        schemaTypeArray &&
        fieldSchemaType.caster instanceof mongooseSchemaTypes.Date;

      const schemaTypeArrayOfStrings =
        schemaTypeArray &&
        fieldSchemaType.caster instanceof mongooseSchemaTypes.String;

      if (schemaTypeNumber || schemaTypeArrayOfStrings) {
        const { gte, gt, lte, lt } = queryObject[key];
        if (gte || gt || lte || lt) continue;
        const selections = queryObject[key].split(',');
        queryObject[key] = { in: selections };
      }

      if (schemaTypeString) {
        const searchString = queryObject[key];
        queryObject[key] = { regex: searchString, $options: 'i' };
      }
    }

    console.log(queryObject);

    const filteredObj = JSON.parse(
      JSON.stringify(queryObject).replace(
        /\b(gte|gt|lte|lt|in|regex)\b/g,
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
