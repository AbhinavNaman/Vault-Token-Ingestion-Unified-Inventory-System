export interface SecretData {
  path: string
  version?: number
  ttl?: number
  createdTime?: Date | undefined
  owner?: string
}

export interface VaultProvider {
  getProviderName(): string
  fetchSecrets(): Promise<SecretData[]>
}