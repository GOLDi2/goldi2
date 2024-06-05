import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1717581770462 implements MigrationInterface {
  name = 'Setup1717581770462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`device_model\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`current_version\` varchar(255) NULL, \`target_version\` varchar(255) NULL, \`target_url\` varchar(255) NULL, \`last_contact\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`device_model\``);
  }
}
