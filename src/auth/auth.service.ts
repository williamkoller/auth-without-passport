import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './signup/dtos/signup.dto';
import { hash, verify } from 'argon2';
import { LoginDto } from './signup/dtos/login.dto';

interface User {
  // Note: we're just putting this here, but ideally - this would be in it's own file - interfaces/user.ts
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  private users: User[] = [];

  constructor(private readonly jwtService: JwtService) {}

  findUser(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  createAccessToken(username: string): { accessToken: string } {
    return { accessToken: this.jwtService.sign({ sub: username }) };
  }

  async signup(newUser: SignupDto): Promise<{ accessToken: string }> {
    if (newUser.password !== newUser.confirmationPassword) {
      throw new BadRequestException(
        'Passwords or ConfirmationPassword do not match',
      );
    }
    if (this.users.find((u) => u.username === newUser.username)) {
      throw new ConflictException(
        `User with username ${newUser.username} already exists`,
      );
    }
    const user = {
      username: newUser.username,
      password: await hash(newUser.password),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
    this.users.push(user);
    return this.createAccessToken(user.username);
  }

  async login(user: LoginDto): Promise<{ accessToken: string }> {
    try {
      const existingUser = this.findUser(user.username);
      if (!user) {
        throw new Error();
      }
      const passwordMatch = await verify(existingUser.password, user.password);
      if (!passwordMatch) {
        throw new Error();
      }
      return this.createAccessToken(user.username);
    } catch (e) {
      throw new UnauthorizedException(
        'Username or password may be incorrect. Please try again',
      );
    }
  }
}
