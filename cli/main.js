import { harness } from "../core/main.js";
import { logger } from "../core/services/logger.service.js";

try {
    // harness.run();
    harness.test();
} catch(err) {
    logger.app.error({ message: err.message });
}
