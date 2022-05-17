import log from "../logger";

import { Request, Response } from "express";
import { omit } from "lodash";
import { createUser } from "../services/user.service";

export async function createUserHandler(req: Request, res: Response) {
    try {
        const user = await createUser(req.body);

        return res.send(
            omit(
                user.toJSON(), "password"
            )
        );
    } catch (error: any) {
        log.error(error);

        return res
            .status(409)
            .send(error.message);
    }
};