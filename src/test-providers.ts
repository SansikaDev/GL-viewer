import {
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';

const testProviders: Array<Provider | EnvironmentProviders> = [provideZonelessChangeDetection()];

export default testProviders;
