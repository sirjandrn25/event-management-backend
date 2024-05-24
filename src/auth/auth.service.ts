import { MailerService } from '@nestjs-modules/mailer';
import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EmailDto,
  EmailLoginDto,
  EmailRegisterDto,
  ForgotPasswordDto,
} from './dto/email-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private service: PrismaService,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
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

    const isValidPassword = await argon.verify(
      user.password,
      emailLoginDto.password,
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

  sendMail({
    email,
    subject,
    message,
  }: {
    email: string;
    subject: string;
    message: string;
  }) {
    this.mailService.sendMail({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      text: message,
    });
  }

  async makeHashPassword(password: string) {
    return await argon.hash(password);
  }
  async register(emailRegisterDto: EmailRegisterDto) {
    const hashedPassword = await this.makeHashPassword(
      emailRegisterDto.password,
    );

    emailRegisterDto.password = hashedPassword;
    const existedUser = await this.service.user.findUnique({
      where: {
        email: emailRegisterDto.email,
      },
    });
    if (existedUser) throw new HttpException('Email Already Registered', 400);
    const verifyCode = this.generateToken();
    const user = await this.service.user.create({
      data: {
        ...emailRegisterDto,
        code: verifyCode,
      },
    });
    this.sendMail({
      email: user?.email,
      subject: 'Verify Email',
      message: `Your verification code is ${verifyCode}`,
    });
    return user;
  }

  async forgotPassword(data: EmailDto) {
    const verifyCode = this.generateToken();

    const user = await this.service.user.update({
      where: {
        email: data.email,
      },
      data: {
        code: verifyCode,
      },
    });
    this.sendMail({
      email: data.email,
      subject: 'Forgot Password',
      message: `Your forgot password verification code is ${verifyCode}`,
    });
    return user;
  }

  async forgotPasswordVerify(data: ForgotPasswordDto) {
    const hashedPassword = await this.makeHashPassword(data.password);
    return await this.service.user.update({
      where: {
        email: data.email,
      },
      data: {
        password: hashedPassword,
        code: null,
      },
    });
  }

  async isVerifyCode(email: string, code: string) {
    const user = await this.service.user.findUnique({
      where: {
        email: email,
      },
    });

    return user?.code === code;
  }

  async me(userId: string) {
    return await this.service.user.findUnique({ where: { id: userId } });
  }

  async verifyEmail(email: string) {
    return await this.service.user.update({
      where: {
        email,
      },
      data: {
        isVerifiedEmail: new Date(),
        code: null,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    return await this.service.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
    });
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

  async resendToken(email: string) {
    const verifyToken = this.generateToken();
    await this.service.user.update({
      where: {
        email,
      },
      data: {
        code: verifyToken,
      },
    });
    this.sendMail({
      email,
      subject: 'Resend Token',
      message: `Your verification code is ${verifyToken}`,
    });
  }
  generateToken = () => {
    const fourDigit = Math.floor(1000 + Math.random() * 9000);
    return fourDigit.toString();
  };
}
