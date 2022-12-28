import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { RegMedium, User, UserSchema } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre<User>('save', function (next) {
            const user = this;
            if (user.reg_medium === RegMedium.LOCAL) {
              if (user.password) {
                bcrypt.genSalt(10, function (err, salt) {
                  if (err) return next(err);

                  bcrypt.hash(user?.password, salt, (err, hash) => {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                  });
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
  providers: [UsersService],
  exports: [MongooseModule],
})
export class UsersModule {}
