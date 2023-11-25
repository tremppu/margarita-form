import { BaseManager, Managers } from './margarita-form-base-manager';
import { MFC, MargaritaFormConfig } from '../margarita-form-types';

// Extends types
declare module './margarita-form-base-manager' {
  export interface Managers {
    config: ConfigManager<MFC>;
  }
}

export const getDefaultConfig = (): Required<MargaritaFormConfig> => ({
  addMetadata: false,
  afterChangesDebounceTime: 10,
  allowUnresolvedArrayChildNames: false,
  allowConcurrentSubmits: false,
  asyncFunctionWarningTimeout: 5000,
  clearStorageOnSuccessfullSubmit: true,
  appendNodeValidationsToControl: true,
  appendControlValidationsToNode: true,
  resolveNodeTypeValidationsToControl: true,
  disableFormWhileSubmitting: true,
  handleSuccesfullSubmit: 'disable',
  resetFormOnFieldChanges: false,
  showDebugMessages: false,
  storageKey: 'key',
  storageStrategy: 'start',
  syncronizationKey: 'key',
  allowInvalidSubmit: false,
  transformUndefinedToNull: false,
  allowEmptyString: false,
  localizationOutput: 'object',
  requiredNameCase: false,
  resolveInitialValuesFromSearchParams: false,
  runTransformersForInitialValues: true,
});

class ConfigManager<CONTROL extends MFC = MFC> extends BaseManager<MargaritaFormConfig> {
  public static override managerName: keyof Managers = 'config';
  constructor(public override control: CONTROL) {
    const defaultConfig = getDefaultConfig();
    super(control, defaultConfig);
    this.updateConfig();
  }

  public override onInitialize(): void {
    this.createSubscription(this.control.managers.field.changes, () => {
      this.updateConfig();
    });
  }

  public updateConfig() {
    const parentConfig = this.control.isRoot ? {} : this.control.parent.config;
    const config = ConfigManager.joinConfigs(parentConfig, this.control.config);
    this.value = config;
  }

  public static joinConfigs(...configs: (undefined | Partial<MargaritaFormConfig>)[]): MargaritaFormConfig {
    const defaultConfig = getDefaultConfig();
    const config = configs.reduce((acc, config) => (config ? { ...acc, ...config } : acc), defaultConfig) as MargaritaFormConfig;
    return config;
  }
}

export { ConfigManager };
