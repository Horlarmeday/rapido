import { Document, HydratedDocument, Model } from 'mongoose';

export const create = async (model: Model<HydratedDocument<any>>, fields) =>
  model.create({ ...fields });
export const findOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.findOne({ ...query });
export const findById = async (
  model: Model<HydratedDocument<any>>,
  id: string,
  options?: object | string | [string],
) => model.findById(id, options).exec();
export const find = async (model: Model<HydratedDocument<any>>, query: any) =>
  model.find({ ...query }).exec();
export const deleteOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.deleteOne({ ...query });
export const deleteMany = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.deleteMany({ ...query });
export const updateMany = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.updateMany({ ...query });
export const updateOne = async (
  model: Model<HydratedDocument<any>>,
  query: any,
) => model.updateOne({ ...query });
