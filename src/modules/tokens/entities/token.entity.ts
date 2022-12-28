import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

export enum TokenType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  FORGOT_PASSWORD = 'FORGOT',
}

@Schema()
export class Token {
  @Prop({ required: true, type: String })
  token: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({
    required: true,
    enum: {
      values: [TokenType.EMAIL, TokenType.PHONE, TokenType.FORGOT_PASSWORD],
    },
  })
  type: TokenType;

  @Prop({ required: true, type: Date })
  expires_in: Date;
}
export const TokenSchema = SchemaFactory.createForClass(Token);
