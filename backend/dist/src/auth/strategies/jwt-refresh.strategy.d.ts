import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../../common/types';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor();
    validate(_req: Request, payload: JwtPayload): JwtPayload;
}
export {};
