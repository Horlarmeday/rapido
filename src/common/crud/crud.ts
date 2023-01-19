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
 */
export const findOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
  selectFields?: any,
) =>
  model
    .findOne({ ...query })
    .select(selectFields)
    .exec();

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
 */
export const find = async (model: Model<HydratedDocument<any>>, query: any) =>
  model.find({ ...query }).exec();

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
