import mongoose from "mongoose";
import config from "config";
import log from "../logger";

function connect() {
    const mongo_uri = config.get("mongo_uri") as string;

    return mongoose
        .connect(mongo_uri)
        .then(() => {
            log.info("Database connected");
        })
        .catch((error) => {
            log.error("DB Error: ", error);
            process.exit(1);
        });
}

export default connect;