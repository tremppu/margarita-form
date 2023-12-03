/* eslint-disable @typescript-eslint/no-unused-vars */
import './storage-extension-types';
import { Observable, filter, map } from 'rxjs';
import { valueExists } from '../../helpers/check-value';
import { ExtensionName, Extensions, MFC } from '../../margarita-form-types';
import { MargaritaFormControl } from '../../margarita-form-control';
import { ExtensionBase } from '../base/extension-base';
import { StorageExtensionConfig } from './storage-extension-types';

export const storageExtensionDefaultConfig: StorageExtensionConfig = {
  clearStorageOnSuccessfullSubmit: true,
  storageKey: 'key',
  storageStrategy: 'start',
  resolveInitialValuesFromSearchParams: false,
};
export class StorageExtensionBase extends ExtensionBase {
  public override config: StorageExtensionConfig = storageExtensionDefaultConfig;
  public static override extensionName: ExtensionName = 'storage';

  public override readonly activeCheck = (control: MFC) => {
    const { storageStrategy } = this.getConfig(control);
    // Allow storage if strategy is 'end' and control has no child controls
    if (storageStrategy === 'end') {
      if (control.expectChildControls) return false;
      return true;
    }
    // Allow storage if strategy is 'start' and control is the root control
    if (control.isRoot) return true;
    return false;
  };

  constructor(public override root: MFC) {
    super(root);
    MargaritaFormControl.extend({
      get storage(): Extensions['storage'] {
        return this.extensions.storage;
      },
    });
  }

  public getItem(key: string): unknown {
    throw new Error('Method not implemented.');
  }

  public setItem(key: string, value: unknown): void {
    throw new Error('Method not implemented.');
  }

  public removeItem(key: string): void {
    throw new Error('Method not implemented.');
  }

  public listenToChanges<DATA>(key: string): any {
    throw new Error('Method not implemented.');
  }

  public getStorageKey(control = this.root): string {
    const { storageKey } = this.getConfig(control);
    if (typeof storageKey === 'function') return storageKey(control);
    const key = control[storageKey || 'key'];
    if (!key) throw new Error(`Could not get storage key from control!`);
    return key;
  }

  public transformFromStorageValue = <TYPE = any>(value: any): TYPE | undefined => {
    try {
      if (!valueExists(value)) return undefined;
      if (typeof value === 'string' && /^[{[].+[}\]]$/g.test(value)) return JSON.parse(value);
      return value as TYPE;
    } catch (error) {
      return value as TYPE;
    }
  };

  public override getValueSnapshot = <TYPE = any>(control = this.root): TYPE | undefined => {
    const key = this.getStorageKey(control);
    const storageValue = this.getItem(key);
    return this.transformFromStorageValue(storageValue);
  };

  public override getValueObservable = <TYPE = any>(control = this.root): Observable<TYPE | undefined> => {
    const key = this.getStorageKey(control);
    try {
      return this.listenToChanges<TYPE>(key).pipe(filter(valueExists), map(this.transformFromStorageValue));
    } catch (error) {
      throw { message: `Could not get value!`, error };
    }
  };

  public override handleValueUpdate = (control = this.root, value: any): void => {
    const key = this.getStorageKey(control);
    if (!valueExists(value)) return this.clearStorageValue(key);

    try {
      if (typeof value === 'object') {
        const stringified = JSON.stringify(value);
        return this.handleValueUpdate(control, stringified);
      }

      const validValid = valueExists(value);
      if (!validValid) return this.clearStorageValue(key);
      if (value === '{}') return this.clearStorageValue(key);

      this.setItem(key, value);
    } catch (error) {
      console.error(`Could not save value!`, { control, error });
    }
  };

  public clearStorage(control = this.root) {
    this.clearStorageValue(this.getStorageKey(control));
  }

  public clearStorageValue(key: string): void {
    try {
      const sessionStorageValue = this.getItem(key);
      if (sessionStorageValue) this.removeItem(key);
    } catch (error) {
      console.error(`Could not clear value!`, { control: this.root, error });
    }
  }

  public static override withConfig(config: StorageExtensionConfig) {
    return super.withConfig(config);
  }
}

export * from './storage-extension-types';
