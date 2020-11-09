import { Controller, Post, Get, Res, Req, Session, Body } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async authLogin(@Req() req, @Res() res, @Body() body) {
    var data = await this.authService.login(
      body.nick,
      body.password,
      body.role ? body.role : 'admin',
    );
    if (!data.success) {
      return res.json({ success: false });
    }
    var tm = 1000 * 60 * 60 * 60 * 60 * 3;
    res.cookie('authToken', data.access_token, {
      maxAge: tm,
      httpOnly: true,
    });
    return res.json(data);
  }

  @Post('login/app')
  async authLoginApp(@Req() req, @Res() res, @Body() body) {
    var data = await this.authService.loginApp(
      body.nick,
      body.password,
      body.role,
    );
    return res.json(data);
  }

  @Get('check')
  async checkAuth(@Req() req, @Res() res, @Session() session) {
    var data: any = await this.authService.checkAuth(req.cookies);
    // return res.json({ success: true });
    return res.json(data);
  }


  @Get('get/current/user')
  async getCurrentUser(@Req() req, @Res() res) {
    return res.json(await this.authService.getCurrentUser(req.cookies));
  }

  @Get('get/current/user/token')
  async getCurrentUserToken(@Req() req, @Res() res) {
    return res.json(await this.authService.getCurrentUserToken(req.cookies));
  }

  @Post('token/check')
  async checkAuthCheck(@Req() req, @Res() res, @Body() body) {
    var data: { success: boolean, user?: any } = await this.authService.checkAuthApp(body.token);
    return res.json({ success: data.success, user: data.user });
  }

  @Post('logout')
  logout(@Req() req, @Res() res) {
    res.clearCookie('authToken');
    return res.json({});
  }

  @Post('check/password')
  async checkPassword(@Res() res, @Body() body) {
    return res.json(await this.authService.checkSomePassword(body.password))
  }

  @Post('check/user/password')
  async checkUserPassword(@Res() res, @Body() body) {
    return res.json({ confirm: await this.authService.checkUserPassword(body.id, body.password) })
  }

}
