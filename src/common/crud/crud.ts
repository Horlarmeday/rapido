import { HydratedDocument, Model, Types } from 'mongoose';

/**
 * Insert data into a document
 * @param model
 * @param fields
 */
export const create = async (
  model: Model<HydratedDocument<any>>,
  fields: object,
) => model.create({ ...fields });

/**
 * Find one document that matches filter
 * @param model
 * @param query
 * @param selectFields
 * @param populate
 */
export const findOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
  selectFields?: any,
  populate?: string | string[],
) =>
  model
    .findOne({ ...query })
    .select(selectFields)
    .populate(<string | string[]>populate);

/**
 * Find document that matches ID
 * @param model
 * @param id
 * @param options
 */
export const findById = async (
  model: Model<HydratedDocument<any>>,
  id: Types.ObjectId,
  options?: object | string | [string],
) => model.findById(id, options).exec();

/**
 * Find all documents that matches filter
 * @param model
 * @param query
 * @param selectFields
 */
export const find = async (
  model: Model<HydratedDocument<any>>,
  query: any,
  selectFields?: any,
) =>
  model
    .find({ ...query })
    .select(selectFields)
    .exec();

/**
 * Delete one document that matches filter
 * @param model
 * @param query
 */
export const deleteOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.deleteOne({ ...query });

/**
 * Delete many documents that matches filter
 * @param model
 * @param query
 */
export const deleteMany = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.deleteMany({ ...query });
/**
 * Update many documents that matches filter
 * @param model
 * @param query
 * @param fieldsToUpdate
 */
export const updateMany = async (
  model: Model<HydratedDocument<any>>,
  query: object,
  fieldsToUpdate: object,
) => model.updateMany({ ...query }, { $set: fieldsToUpdate });

/**
 * Update one document that matches filter
 * @param model
 * @param query
 * @param fieldsToUpdate
 */
export const updateOne = async (
  model: Model<HydratedDocument<any>>,
  query: object,
  fieldsToUpdate: object,
) => model.updateOne({ ...query }, { $set: fieldsToUpdate });

/**
 * Find all documents that matches filter and limits
 * @param model
 * @param query
 * @param limit
 * @param offset
 * @param selectFields
 */
export const findAndCountAll = async (
  model: Model<HydratedDocument<any>>,
  query: any,
  limit: number,
  offset: number,
  selectFields?: any,
) =>
  model
    .find({ ...query })
    .select(selectFields)
    .limit(limit)
    .skip(offset)
    .exec();

export const countDocuments = async (
  model: Model<HydratedDocument<any>>,
  filter = {},
) => model.countDocuments({ ...filter }).exec();
