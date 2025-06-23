import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1750679570639 implements MigrationInterface {
  name = "CreateUsersTable1750679570639";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TYPE \"public\".\"users_role_enum\" AS ENUM('admin', 'user')");
    await queryRunner.query("CREATE TABLE \"users\" (\"id\" uuid NOT NULL DEFAULT gen_random_uuid(), \"name\" character varying(100) NOT NULL, \"email\" character varying NOT NULL, \"password\" character varying, \"refresh_token\" character varying, \"role\" \"public\".\"users_role_enum\" NOT NULL DEFAULT 'user', \"last_login\" TIMESTAMP, \"provider\" character varying, \"providerId\" character varying, \"created_at\" TIMESTAMP NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT \"UQ_97672ac88f789774dd47f7c8be3\" UNIQUE (\"email\"), CONSTRAINT \"PK_a3ffb1c0c8416b9fc6f907b7433\" PRIMARY KEY (\"id\"))");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE \"users\"");
    await queryRunner.query("DROP TYPE \"public\".\"users_role_enum\"");
  }

}
