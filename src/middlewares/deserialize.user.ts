import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { decode } from "../utils/jwt";
import { reIssueAccessToken } from "../services/session.service";

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

    const refresh_token = get(req, "headers.x-refresh");

    if (!access_token) return next();

    const { decoded, expired } = decode(access_token);

    if (decoded) {
        // @ts-ignore
        req.user = decoded;

        return next();
    }

    if (expired && refresh_token) {
        const new_access_token = await reIssueAccessToken({ refresh_token });

        if (new_access_token) {
            // Add the new access token to the response header
            res.setHeader("x-access-token", new_access_token);

            const { decoded } = decode(new_access_token);

            // @ts-ignore
            req.user = decoded;
        }

        return next();
    }

    return next();
};

export default deserializeUser;