import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUser1749999999999 implements MigrationInterface {
  name = 'AddRefreshTokenToUser1749999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`refreshToken\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`refreshToken\``,
    );
  }
}
