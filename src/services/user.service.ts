import { DocumentDefinition, FilterQuery } from "mongoose";
import { omit } from "lodash";

import User, { UserDocument } from "../models/user.model";

export async function createUser(input: DocumentDefinition<UserDocument>) {
    try {
        return await User.create(input);
    } catch (error) {
        // @ts-ignore
        throw new Error(error);
    }
};

export async function findUser(query: FilterQuery<UserDocument>) {
    return User.findOne(query).lean();
};

export async function validatePassword(
    {
        email,
        password,
    }: {
        email: UserDocument["email"];
        password: string;
    }
) {
    const user = await User.findOne({ email });

    if (!user) return false;

    const is_valid = await user.comparePassword(password);

    if (!is_valid) return false;

    return omit(user.toJSON(), "password");
};