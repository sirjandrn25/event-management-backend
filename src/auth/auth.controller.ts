import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { EmailRegisterDto } from './dto/email-register.dto';
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
