import { QueryRunner } from 'typeorm';
import { AddRefreshTokenToUser1749999999999 } from './AddRefreshTokenToUser';

describe('AddRefreshTokenToUser Migration', () => {
  let migration: AddRefreshTokenToUser1749999999999;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new AddRefreshTokenToUser1749999999999();

    queryRunner = {
      query: jest.fn(),
    } as any;
  });

  it('should run up migration', async () => {
    await migration.up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith(
      `ALTER TABLE \`user\` ADD \`refreshToken\` varchar(255) NULL`,
    );
  });

  it('should run down migration', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith(
      `ALTER TABLE \`user\` DROP COLUMN \`refreshToken\``,
    );
  });

  it('should have correct migration name', () => {
    expect(migration.name).toBe('AddRefreshTokenToUser1749999999999');
  });
});
