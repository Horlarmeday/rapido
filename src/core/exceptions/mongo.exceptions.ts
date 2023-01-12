import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';

@Catch()
export class MongoExceptions implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    /**
     * @description Exception json response
     * @param type
     * @param message
     */
    const responseMessage = (type, message) => {
      response.status(status).json({
        statusCode: status,
        errorType: type ?? 'Error',
        errorMessage: message,
      });
    };
    console.log(exception?.stack);
    return responseMessage(exception.name, exception?.message);
  }
  // catch(exception: MongooseError, host: ArgumentsHost) {
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse();
  //   const request = ctx.getRequest();
  //
  //   /**
  //    * @description Exception json response
  //    * @param type
  //    * @param errors
  //    * @param status
  //    * @param message
  //    */
  //   const responseMessage = ({ type, status, message }) => {
  //     response.status(status).json({
  //       statusCode: status,
  //       errorType: type,
  //       message,
  //     });
  //   };
  //
  //   switch (exception.name) {
  //     case 'ValidationError':
  //       return responseMessage({
  //         type: exception.name,
  //         status: HttpStatus.BAD_REQUEST,
  //         message: exception.message,
  //       });
  //
  //     case 'CastError':
  //       return responseMessage({
  //         type: exception.name,
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: exception.message,
  //       });
  //
  //     default:
  //       return responseMessage({
  //         type: exception.name,
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: exception.message,
  //       });
  //   }
  // }
}
