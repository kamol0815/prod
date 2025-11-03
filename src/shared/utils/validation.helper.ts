import { Types } from 'mongoose';

export class ValidationHelper {
  static isValidObjectId(id: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }
    return Types.ObjectId.isValid(id);
  }
}
