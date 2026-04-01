import axios from "axios"
import type { VaultProvider, SecretData } from "./provider.interface.ts"
import { logger } from "../utils/logger.ts"

export class HashicorpProvider implements VaultProvider {

    private baseUrl: string
    private token: string
    private rootPath: string

    constructor(baseUrl: string, token: string, rootPath: string) {

        this.baseUrl = baseUrl
        this.token = token
        this.rootPath = rootPath

    }

    getProviderName(): string {
        return "hashicorp"
    }

    async fetchSecrets(): Promise<SecretData[]> {

        const secrets: SecretData[] = []

        await this.traversePath("", secrets)

        return secrets
    }

    private async traversePath(path: string, secrets: SecretData[]) {

        try {

            const listUrl = path === ""
                ? `${this.baseUrl}/v1/${this.rootPath}/metadata?list=true`
                : `${this.baseUrl}/v1/${this.rootPath}/metadata/${path}?list=true`

            const res = await axios.get(listUrl, {
                headers: { "X-Vault-Token": this.token }
            })

            const keys = res.data?.data?.keys || []

            for (const key of keys) {

                if (key.endsWith("/")) {

                    const folder = path === ""
                        ? key.slice(0, -1)
                        : `${path}/${key.slice(0, -1)}`

                    await this.traversePath(folder, secrets)

                } else {

                    const secretPath = path === ""
                        ? key
                        : `${path}/${key}`

                    const metadata = await this.getSecretMetadata(secretPath)

                    secrets.push(metadata)
                }
            }

        } catch (err: any) {

            if (err.response?.status === 403) {
                logger.warn(`Permission denied for path ${path}`)
            } else {
                logger.error(`Traversal error ${path}: ${err.message}`)
            }
        }
    }

    private async getSecretMetadata(secretPath: string): Promise<SecretData> {

        const url = `${this.baseUrl}/v1/${this.rootPath}/metadata/${secretPath}`

        const res = await axios.get(url, {
            headers: { "X-Vault-Token": this.token }
        })

        const metadata = res.data?.data

        return {
            path: `${this.rootPath}/${secretPath}`,
            version: metadata?.current_version,
            createdTime: metadata?.created_time
                ? new Date(metadata.created_time)
                : undefined
        }
    }
}

// async getSecretValue(path: string) {
//         const url = `${this.baseUrl}/v1/${this.rootPath}/data/${path}`

//         const res = await axios.get(url, {
//             headers: { "X-Vault-Token": this.token }
//         })

//         return res.data.data.data
//     }