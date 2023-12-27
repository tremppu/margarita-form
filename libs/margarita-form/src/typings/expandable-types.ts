/* eslint-disable @typescript-eslint/no-unused-vars */

import { FieldName } from './margarita-form-types';

export interface FieldParams {
  value?: any;
  fields?: any;
  parent?: any;
  name?: FieldName;
}

export interface FieldBase<PARAMS extends FieldParams> {
  // Empty by default
}
export interface ControlContext {
  [key: string]: unknown;
}

export interface Managers {
  [key: string]: unknown;
}

export interface Extensions {
  [key: string]: unknown;
}

export interface Configs {
  //
}
