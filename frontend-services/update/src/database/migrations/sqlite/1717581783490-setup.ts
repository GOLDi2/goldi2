import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1717581783490 implements MigrationInterface {
  name = 'Setup1717581783490';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_model" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar, "current_version" varchar, "target_version" varchar, "target_url" varchar, "last_contact" datetime)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "device_model"`);
  }
}
