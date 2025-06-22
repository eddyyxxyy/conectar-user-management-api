import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../enums/user-role.enum";
import * as bcrypt from "bcrypt";

@Entity("users")
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ name: "refresh_token", nullable: true })
  refreshToken?: string;

  @Column({ type: process.env.NODE_ENV === "test" ? "text" : "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: "last_login", type: process.env.NODE_ENV === "test" ? "text" : "timestamp", nullable: true })
  lastLogin: Date | null;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerId?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}

export { User };