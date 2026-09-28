import { readJson } from "./utils";



const _artifactRoot = "./.ai";
const _statusArtifact = "status.json";


export const repoService = {


    getArtifactRoot() {
        return _artifactRoot;
    },


    getStatusArtifact() {
        return _statusArtifact;
    },


    readStatus(repo, session) {
        readJson(`${repo}/${_artifactRoot}/${session}/${_statusArtifact}`).status.toLowerCase();
    }

}
