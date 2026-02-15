import dataSource, { cliDataSourceOptions } from './typeorm-cli.config';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

describe('TypeORM CLI Config', () => {
  const options = cliDataSourceOptions as MysqlConnectionOptions;

  it('should use mysql', () => {
    expect(options.type).toBe('mysql');
  });

  it('should have numeric port', () => {
    expect(typeof options.port).toBe('number');
  });

  it('should disable synchronize', () => {
    expect(options.synchronize).toBe(false);
  });

  it('should define entities and migrations', () => {
    expect(options.entities).toBeDefined();
    expect(options.migrations).toBeDefined();
  });

  it('should export DataSource instance', () => {
    expect(dataSource).toBeDefined();
    expect(dataSource.options).toEqual(cliDataSourceOptions);
  });
});
