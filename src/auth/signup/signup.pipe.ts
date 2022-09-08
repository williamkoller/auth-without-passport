import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';

@Injectable()
export class SignupPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    const errors: string[] = [];
    if (!this.valueHasPassAndConfPass(value)) {
      throw new BadRequestException('Invalid Request Body');
    }
    // you'll probably want to add in your own business rules here as well
    if (value.password.length < 12) {
      errors.push('password should be at least 12 characters long');
    }
    if (value.password !== value.confirmationPassword) {
      errors.push('password and confirmationPassword do not match');
    }
    if (errors.length) {
      throw new BadRequestException(errors.join('\n'));
    }
    return value;
  }

  private valueHasPassAndConfPass(val: unknown): val is SignupDto {
    return (
      typeof val === 'object' &&
      'password' in val &&
      'confirmationPassword' in val
    );
  }
}
