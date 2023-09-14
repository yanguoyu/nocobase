import { Transactionable } from 'sequelize';
import { Collection } from '../collection';
import QueryInterface from './query-interface';

export default class OracleQueryInterface extends QueryInterface {
  async collectionTableExists(collection: Collection<any, any>, options?: Transactionable): Promise<boolean> {
    const transaction = options?.transaction;

    const tableName = collection.model.tableName;

    const sql = `select table_name from user_tables where table_name='${tableName}';`;

    const results = await this.db.sequelize.query(sql, { type: 'SELECT', transaction });
    return results.length > 0;
  }

  listViews() {
    return [];
  }

  viewDef(viewName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  viewColumnUsage(options: {
    viewName: string;
    schema?: string;
  }): Promise<{ [view_column_name: string]: { column_name: string; table_name: string; table_schema?: string } }> {
    throw new Error('Method not implemented.');
  }
  parseSQL(sql: string) {
    throw new Error('Method not implemented.');
  }
}
