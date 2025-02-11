import { Credentials } from "@/types/credentials";

export const addCredentials = (credentialsMap: Map<string, Credentials>, credentialsList: string[], credentials: Credentials, limit: number) => {
    credentialsMap.set(credentials.id, credentials);
    credentialsList.push(credentials.id);
    if(credentialsList.length > limit){
        const id = credentialsList.shift()!; // limit is always > 0
        credentialsMap.delete(id);
    }
    return credentialsList;
}