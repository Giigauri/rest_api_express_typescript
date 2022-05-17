import config from "config";

import { LeanDocument, FilterQuery, UpdateQuery } from "mongoose";
import { get } from "lodash";
import { UserDocument } from "../models/user.model";
import { sign, decode } from "../utils/jwt";
import { findUser } from "./user.service";

import Session, { SessionDocument } from "../models/session.model";

export async function createSession(userId: string, userAgent: string) {
    const session = await Session.create({ user: userId, userAgent });
  
    return session.toJSON();
};

export function createAccessToken(
    {
        user,
        session,
    }: {
        user:
            | Omit<UserDocument, "password">
            | LeanDocument<Omit<UserDocument, "password">>;
        session:
            | Omit<SessionDocument, "password">
            | LeanDocument<Omit<SessionDocument, "password">>;
    }
) {
    // ========== Build and return the new access token ========== //
    const access_token = sign(
        { ...user, session: session._id },

        // ========== 15 minutes ========== //
        { expiresIn: config.get("accessTokenTtl") }
    );
  
    return access_token;
}

export async function reIssueAccessToken(
    {
        refresh_token,
    }: {
        refresh_token: string;
    }
) {
    // ========== Decode the refresh token ========== //
    const { decoded } = decode(refresh_token);
  
    if (!decoded || !get(decoded, "_id")) return false;
  
    // ========== Get the session ========== //
    const session = await Session.findById(get(decoded, "_id"));
  
    // ========== Make sure the session is still valid ========== //
    if (!session || !session?.valid) return false;
  
    const user = await findUser({ _id: session.user });
  
    if (!user) return false;
  
    const access_token = createAccessToken({ user, session });
  
    return access_token;
};

export async function updateSession(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
) {
    return Session.updateOne(query, update);
};
  
export async function findSessions(query: FilterQuery<SessionDocument>) {
    return Session.find(query).lean();
};