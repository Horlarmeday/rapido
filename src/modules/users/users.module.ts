import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RegMedium, User, UserSchema } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { TokensModule } from '../tokens/tokens.module';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { UserSettingsModule } from '../user-settings/user-settings.module';

@Module({
  imports: [
    TokensModule,
    UserSettingsModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre<User>('save', function (next) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const user = this;
            if (user.reg_medium === RegMedium.LOCAL) {
              if (user.profile.password) {
                bcrypt.genSalt(10, function (err, salt) {
                  if (err) return next(err);

                  bcrypt.hash(
                    <string | Buffer>user.profile?.password,
                    salt,
                    (err, hash) => {
                      if (err) return next(err);
                      user.profile.password = hash;
                      next();
                    },
                  );
                });
              }
            }
          });
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, FileUploadHelper, GeneralHelpers],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
