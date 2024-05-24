import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import {
  EmailDto,
  EmailLoginDto,
  EmailRegisterDto,
  EmailVerifyDto,
  ForgotPasswordDto,
} from './dto/email-register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthEntity } from './entities/auth.entity';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: UserEntity })
  async register(@Body() data: EmailRegisterDto) {
    return new UserEntity(await this.authService.register(data));
  }

  @Post('login')
  @ApiCreatedResponse({ type: AuthEntity })
  async login(@Body() data: EmailLoginDto) {
    return this.authService.login(data);
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.authService.logout(request.user.id);
  }

  @ApiBearerAuth()
  @Post('me')
  @ApiCreatedResponse({ type: UserEntity })
  @UseGuards(AuthGuard('jwt'))
  public async me(@Request() request): Promise<any> {
    return new UserEntity(await this.authService.me(request.user.id));
  }

  @Post('verify-email')
  @ApiCreatedResponse({ type: UserEntity })
  public async verifyEmail(@Body() data: EmailVerifyDto) {
    const isVerifyToken = await this.authService.isVerifyCode(
      data.email,
      data.code,
    );
    if (!isVerifyToken)
      throw new HttpException('Code is not matched', HttpStatus.BAD_REQUEST);
    return new UserEntity(await this.authService.verifyEmail(data.email));
  }
  @Post('forgot-password')
  @ApiCreatedResponse({ type: UserEntity })
  public async forgotPassword(@Body() data: EmailDto) {
    return new UserEntity(await this.authService.forgotPassword(data));
  }

  @ApiCreatedResponse({ type: UserEntity })
  @Post('resend-token')
  public async resendToken(@Body() data: EmailDto) {
    return this.authService.resendToken(data.email);
  }

  @Post('forgot-password-verify')
  @ApiCreatedResponse({ type: UserEntity })
  public async forgotPasswordVerify(@Body() data: ForgotPasswordDto) {
    const isVerifyToken = await this.authService.isVerifyCode(
      data.email,
      data.code,
    );
    if (!isVerifyToken)
      throw new HttpException('Code is not matched', HttpStatus.BAD_REQUEST);
    return new UserEntity(await this.authService.forgotPasswordVerify(data));
  }

  @Post('update-profile')
  @ApiCreatedResponse({ type: UserEntity })
  @UseGuards(AuthGuard('jwt'))
  public async updateProfile(
    @Request() request,
    @Body() data: UpdateProfileDto,
  ) {
    return new UserEntity(
      await this.authService.updateProfile(request.user.id, data),
    );
  }
  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  public async refreshToken(@Request() request) {
    const user = request.user;
    return this.authService.refreshToken(user.id, user.email);
  }
}
