export const create = async (model, fields) => model.create({ ...fields });
export const findOne = async (model, query) => model.findOne({ ...query });
export const findById = async (model, id: string, options?) =>
  model.findById(id, options).exec();
export const find = async (model, query) => model.find({ ...query }).exec();
export const deleteOne = async (model, query) => model.deleteOne({ ...query });
export const deleteMany = async (model, query) =>
  model.deleteMany({ ...query });
export const updateMany = async (model, query) =>
  model.updateMany({ ...query });
export const updateOne = async (model, query) => model.updateOne({ ...query });
