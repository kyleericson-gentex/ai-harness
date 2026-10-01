import { phaseDefinitions } from './phase_definitions.js';
import { logger } from '../logger.service.js';


export const phaseService = {

    get(phaseName) {
        return phaseDefinitions[phaseName];
    }

}

