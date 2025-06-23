import Datasource from "../data-source";
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";
import * as bcrypt from "bcrypt";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function seed() {
  await Datasource.initialize();
  const userRepo = Datasource.getRepository(User);
  await userRepo.deleteAll();

  const users: Partial<User>[] = [
    {
      name: "Admin Example",
      email: "admin@conectar.com",
      password: bcrypt.hashSync("admin123", 10),
      role: UserRole.ADMIN,
      lastLogin: daysAgo(5),
    },
    {
      name: "Usuário Comum",
      email: "user1@conectar.com",
      password: bcrypt.hashSync("user123", 10),
      role: UserRole.USER,
      lastLogin: daysAgo(40),
    },
    {
      name: "Usuário Social Google",
      email: "social@conectar.com",
      provider: "google",
      providerId: "google-123",
      role: UserRole.USER,
    },
  ];

  // Usuários tradicionais
  for (let i = 2; i <= 20; i++) {
    users.push({
      name: `Usuário ${i}`,
      email: `user${i}@conectar.com`,
      password: bcrypt.hashSync("user123", 10),
      role: UserRole.USER,
      lastLogin: i % 3 === 1 ? daysAgo(10) : daysAgo(45),
    });
  }

  // Usuários sociais
  for (let i = 21; i <= 50; i++) {
    const isNeverLogged = i % 3 === 0;
    users.push({
      name: `Usuário Social ${i}`,
      email: `social${i}@conectar.com`,
      provider: "google",
      providerId: `google-${i}`,
      role: UserRole.USER,
      ...(isNeverLogged
        ? {}
        : { lastLogin: i % 3 === 1 ? daysAgo(2) : daysAgo(60) }),
    });
  }

  await userRepo.save(users);
  console.log("Seed concluído!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});