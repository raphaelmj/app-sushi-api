import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';

@Injectable()
export class AuthSimpleMiddleware implements NestMiddleware {

  constructor(private readonly authService: AuthService) { }

  async use(req: any, res: any, next: () => void) {
    next();
    var data = await this.authService.checkAuth(req.cookies)
    if (!data.success) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'unauthorized exception',
      }, 403);
    }
    req.user = data.user
    next();
  }
}
