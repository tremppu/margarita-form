import { MargaritaFormControl } from '../../margarita-form-control';
import { CommonRecord, ExtensionBase, ExtensionName, MFC, MFF, MFGF } from '../../margarita-form-types';
import { LocaleNames, Locales, MargaritaFormHandleLocalize } from './i18n-types';

const fallbackFn = () => ({});

export class I18NExtension implements ExtensionBase {
  public static extensionName: ExtensionName = 'localization';
  public static localeNames?: Record<string, string>;
  public readonly requireRoot = false;

  constructor(public root: MFC) {
    MargaritaFormControl.extend({
      get locales(): Locales {
        if (this.isRoot) return this.field.locales;
        return this.field.locales || this.parent.locales;
      },

      get currentLocale(): LocaleNames {
        if (this.isRoot) return this.field.currentLocale;
        return this.field.currentLocale || this.parent.currentLocale;
      },

      get i18n(): MFF['__i18n'] {
        const { field, extensions } = this as MargaritaFormControl;
        const { i18n } = field;
        if (!i18n) return undefined;
        const { localization } = extensions;
        return localization.getLocalizedValue(i18n, this.currentLocale);
      },
    });
  }

  public modifyField = (field: MFF, parentControl: MFC): MFGF => {
    if (!field.localize) return field;
    return I18NExtension.localizeField(parentControl, field);
  };

  get locales() {
    return this.root.locales;
  }

  get currentLocale() {
    const { currentLocale } = this.root;
    if (!currentLocale) throw 'No current locale provided!';
    return currentLocale;
  }

  public getLocalizedValue<RETURN = any>(obj: unknown, locale: LocaleNames = this.currentLocale): RETURN {
    if (!obj) return obj as RETURN;
    if (!locale) throw 'No locale provided!';
    if (typeof obj !== 'object') return obj as RETURN;
    if (locale in obj) return (obj as CommonRecord)[locale] as RETURN;

    const entries = Object.entries(obj).map(([key, value]) => {
      type CHILD_RETURN = RETURN[keyof RETURN];
      const _value = this.getLocalizedValue<CHILD_RETURN>(value, locale);
      return [key, _value];
    });

    return Object.fromEntries(entries);
  }

  public static localizeField<FIELD extends MFC['field']>(parent: MFC, field: FIELD): MFF {
    const { localizationOutput } = field.config || parent.config;
    const locales = parent.locales || [];
    const localeNames = Object.keys(locales);
    const getValue = (key: 'defaultValue' | 'initialValue') => (field[key] && typeof field[key] === 'object' ? field[key] : undefined);
    const defaultValue = getValue('defaultValue');
    const initialValue = getValue('initialValue');

    const { parent: parentFn = fallbackFn, child: childFn = fallbackFn } =
      field.handleLocalize || parent.getFieldValue<MargaritaFormHandleLocalize<FIELD>>('handleLocalize', {});

    if (localizationOutput === 'array') {
      const { config = {}, ...parentFieldHandlerResult } = parentFn({ field, parent: parent, locales }) as Partial<MFF>;
      const localizedArrayField: MFF = {
        name: field.name,
        localize: false,
        wasLocalized: true,
        defaultValue,
        initialValue,
        grouping: 'array',
        startWith: localeNames,
        ...parentFieldHandlerResult,
        config: { ...config, addMetadata: true },
        fields: localeNames.map((localeName) => {
          const locale = locales[localeName];
          const hasSubFields = field.fields && field.fields.length > 0;
          const { config = {}, ...childFieldHandlerResult } = childFn({ field, parent: parent, locale }) as Partial<MFF>;
          const _field = { ...field, localize: false, wasLocalized: true, config: { addMetadata: false } };
          const res: Partial<MFF> = hasSubFields ? { ..._field, ...childFieldHandlerResult } : childFieldHandlerResult;
          const fields = hasSubFields ? field.fields : [_field];
          return {
            ...res,
            fields,
            localize: false,
            name: localeName,
            isLocaleField: true,
            currentLocale: localeName,
            grouping: 'group',
            initialValue: initialValue ? undefined : field.initialValue,
            config: { ...config, addMetadata: true },
          };
        }),
      };
      return localizedArrayField;
    }

    const localizedObjectField: FIELD = {
      ...field,
      localize: false,
      wasLocalized: true,
      validation: null,
      initialValue,
      ...parentFn({ field, parent: parent, locales }),
      fields: localeNames.map((localeName) => {
        const locale = locales[localeName];
        return {
          ...field,
          localize: false,
          name: localeName,
          isLocaleField: true,
          currentLocale: localeName,
          initialValue: initialValue ? undefined : field.initialValue,
          ...childFn({ field, parent: parent, locale }),
        };
      }),
    };

    return localizedObjectField;
  }
}

export * from './i18n-types';
export * from './i18n-resolvers';
