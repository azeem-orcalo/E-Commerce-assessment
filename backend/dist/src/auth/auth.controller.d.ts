import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        user: Omit<import("../common/types").SafeUser, "updatedAt">;
        accessToken: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: Omit<import("../common/types").SafeUser, "updatedAt">;
        accessToken: string;
    }>;
    refresh(req: Request & {
        user: JwtPayload;
    }, res: Response): Promise<{
        user: Omit<import("../common/types").SafeUser, "updatedAt">;
        accessToken: string;
    }>;
    logout(res: Response): {
        message: string;
    };
    private setRefreshCookie;
}
