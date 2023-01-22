import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  public static CONFIG_KEY = `deresposeConfig`;

  constructor() {}

  getConfig(key: string, defaultValue?: any) {
    const configs = this.getConfigs();

    const value = configs[key];
    if ((value === undefined || value === null) && defaultValue !== undefined) {
      return defaultValue;
    }

    return value;
  }

  setConfig(key: string, value: string) {
    const configs = this.getConfigs();
    configs[key] = value;
    window.localStorage.setItem(
      ConfigService.CONFIG_KEY,
      JSON.stringify(configs),
    );
  }

  getConfigs() {
    const config = window.localStorage.getItem(ConfigService.CONFIG_KEY);
    if (!config) return {};

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(config);
    } catch (e) {
      console.error(e);
    }
    if (!parsedConfig) return {};

    return parsedConfig;
  }
}
