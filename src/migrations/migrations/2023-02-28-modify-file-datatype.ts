import { MigrationInterface } from 'mongo-migrate-ts';
import { Db } from 'mongodb';
import { User } from '../../modules/users/entities/user.entity';

export class UserMigration implements MigrationInterface {
  async up(db: Db): Promise<any> {
    const users = await db.collection<User>('users');
    await users
      .find({ 'pre_existing_conditions.file.size': { exists: false } })
      .forEach((user) => {
        const updatedUser = user.pre_existing_conditions?.map((cond) => {
          if (cond.file) {
            cond.file.url = <string>(<unknown>cond.file);
            cond.file.size = '56kb';
            cond.file.original_name = `${user._id}.jpg`;
          } else {
            // cond.file.url = '';
            // cond.file.size = '';
            // cond.file.original_name = ``;
          }
          return cond;
        });
        //users.save(updatedUser)
      });
  }

  async down(db: Db): Promise<any> {
    await db.dropCollection('my_collection');
  }
}
