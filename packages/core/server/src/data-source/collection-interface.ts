export interface CollectionOptions {
  name: string;
  schema?: string;
  tableName: string;
  title?: string;
  timestamps?: boolean;
  filterTargetKey?: string;
  fields: FieldOptions[];
}

interface FieldOptions {
  name: string;
  field: string;
  rawType: string;
  type: string;
  description?: string;
  interface?: string;
  uiSchema?: any;
  possibleTypes?: string[];
  defaultValue?: any;
  primaryKey: boolean;
  unique: boolean;
  allowNull?: boolean;
  autoIncrement?: boolean;
}
