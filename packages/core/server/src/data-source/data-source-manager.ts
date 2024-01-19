import Application from '../application';
import { DataSourceInterface } from './interface';

export class DataSourceManager {
  public dataSources: Map<string, DataSourceInterface> = new Map();

  constructor(private app: Application) {}

  public add(name: string, dataSource: DataSourceInterface) {
    this.dataSources.set(name, dataSource);
  }

  public middleware() {
    return async (ctx, next) => {};
  }
}
