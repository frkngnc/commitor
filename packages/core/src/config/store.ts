

import Conf from 'conf';
import { CommitorConfig, ConfigStoreOptions, DEFAULT_CONFIG } from './types.js';
import { ConfigSchema } from './schema.js';
import * as crypto from 'crypto';
import os from 'os';

const CONFIG_KEY = 'commitor-config';
const ENCRYPTION_KEY = 'commitor-encryption-key';

export class ConfigStore {
  private store: Conf;
  private encryptionKey: string;

  constructor(options: ConfigStoreOptions = {}) {
    
    this.encryptionKey = this.getOrCreateEncryptionKey();

    
    this.store = new Conf({
      projectName: options.configName || 'commitor',
      cwd: options.cwd,
      encryptionKey: this.encryptionKey
    });
  }

  
  async save(config: CommitorConfig): Promise<void> {
    
    const errors = ConfigSchema.validate(config);
    if (errors.length > 0) {
      const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Invalid configuration: ${errorMessages}`);
    }

    
    const configToSave = { ...config };
    if (configToSave.apiKey) {
      configToSave.apiKey = this.encryptApiKey(configToSave.apiKey);
    }

    
    this.store.set(CONFIG_KEY, configToSave);
  }

  
  async load(): Promise<CommitorConfig | null> {
    const config = this.store.get(CONFIG_KEY) as CommitorConfig | undefined;

    if (!config) {
      return null;
    }

    
    if (config.apiKey) {
      config.apiKey = this.decryptApiKey(config.apiKey);
    }

    return config;
  }

  
  async update(partialConfig: Partial<CommitorConfig>): Promise<void> {
    const existingConfig = await this.load();

    if (!existingConfig) {
      throw new Error('No configuration found. Use save() to create initial configuration.');
    }

    const updatedConfig = { ...existingConfig, ...partialConfig };
    await this.save(updatedConfig);
  }

  
  async clear(): Promise<void> {
    this.store.delete(CONFIG_KEY);
  }

  
  async exists(): Promise<boolean> {
    return this.store.has(CONFIG_KEY);
  }

  
  async getOrDefault(): Promise<CommitorConfig> {
    const config = await this.load();
    return config || DEFAULT_CONFIG;
  }

  
  async get<K extends keyof CommitorConfig>(key: K): Promise<CommitorConfig[K] | undefined> {
    const config = await this.load();
    return config?.[key];
  }

  
  async set<K extends keyof CommitorConfig>(key: K, value: CommitorConfig[K]): Promise<void> {
    const config = await this.load() || DEFAULT_CONFIG;
    config[key] = value;
    await this.save(config);
  }

  
  getConfigPath(): string {
    return this.store.path;
  }

  
  private encryptApiKey(apiKey: string): string {
    
    const iv = crypto.randomBytes(16);

    
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);

    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    
    const authTag = cipher.getAuthTag();

    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  
  private decryptApiKey(encryptedApiKey: string): string {
    try {
      
      const parts = encryptedApiKey.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);

      
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt API key. Configuration may be corrupted.');
    }
  }

  
  private getOrCreateEncryptionKey(): string {
    
    const homeDir = os.homedir();
    const hostname = os.hostname();

    
    const hash = crypto.createHash('sha256');
    hash.update(`${homeDir}-${hostname}-commitor-v1`);

    return hash.digest('hex');
  }
}
