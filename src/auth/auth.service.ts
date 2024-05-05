import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailLoginDto } from './dto/email-login.dto';
import * as bcrypt from 'bcrypt';
import { EmailRegisterDto } from './dto/email-register.dto';

export const roundsOfHashing = 10;
@Injectable()
export class AuthService {
  constructor(
    private service: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(emailLoginDto: EmailLoginDto) {
    const user = await this.service.user.findUnique({
      where: {
        email: emailLoginDto?.email,
      },
    });
    if (!user) {
      throw new NotFoundException(
        `No user found for email: ${emailLoginDto?.email}`,
      );
    }

    const isValidPassword = await bcrypt.compare(
      emailLoginDto.password,
      user.password,
    );
    if (!isValidPassword) throw new UnauthorizedException('Invalid password');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user?.id, tokens.refreshToken);
    return tokens;
  }
  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.service.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(userId, username),
      this.getRefreshToken(userId, username),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(userId: string, username: string) {
    const accessToken = (await this.getTokens(userId, username)).accessToken;
    return {
      accessToken,
    };
  }
  async getAccessToken(userId: string, username: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expiresIn: '3m',
      },
    );
  }
  async getRefreshToken(userId: string, username: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  async register(emailRegisterDto: EmailRegisterDto) {
    const hashedPassword = await bcrypt.hash(
      emailRegisterDto.password,
      roundsOfHashing,
    );

    emailRegisterDto.password = hashedPassword;
    const existedUser = await this.service.user.findUnique({
      where: {
        email: emailRegisterDto.email,
      },
    });
    if (existedUser) throw new HttpException('Email Already Registered', 400);
    const user = await this.service.user.create({
      data: {
        ...emailRegisterDto,
      },
    });
    return user;
  }
  async me(userId: string) {
    return await this.service.user.findUnique({ where: { id: userId } });
  }

  async logout(userId: string) {
    return this.service.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }
}
