export interface TokenData {
  accessor: string
  policies: string[]
  ttl?: number
  createdTime?: Date
}

export interface SecretData {
  path: string
  version?: number
  ttl?: number
  createdTime?: Date
  owner?: string
}

export interface VaultProvider {
  getProviderName(): string
  fetchSecrets(): Promise<SecretData[]>
  fetchTokens?(): Promise<TokenData[]>
}