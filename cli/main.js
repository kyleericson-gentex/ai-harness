import { harness } from "../core/main.js";
import { logger } from "../core/services/logger.service.js";

try {
    harness.run();
} catch(err) {
    logger.app.error({ message: err.message });
}
