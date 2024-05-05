import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailRegisterDto } from './dto/email-register.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EmailLoginDto } from './dto/email-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/users/entities/user.entity';
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

  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  public async refreshToken(@Request() request) {
    const user = request.user;
    return this.authService.refreshToken(user.id, user.email);
  }
}
