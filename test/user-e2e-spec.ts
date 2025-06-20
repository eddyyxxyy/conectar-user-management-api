import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestAppModule } from "./test-app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/entities/user.entity";
import { Repository } from "typeorm";

describe("UserController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/users (POST) - create user", async () => {
    const res = await request(app.getHttpServer())
      .post("/users")
      .send({ name: "Test User", email: "test1@email.com", password: "StrongP@ssw0rd!" })
      .expect(201);
    expect(res.body).toHaveProperty("id");
  });

  it("/users/social (POST) - create social user", async () => {
    const res = await request(app.getHttpServer())
      .post("/users/social")
      .send({ name: "Social User", email: "social@email.com", provider: "google", providerId: "abc123" })
      .expect(201);
    expect(res.body).toHaveProperty("id");
  });

  it("/users (POST) - conflict on duplicate email", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .send({ name: "Test User", email: "test2@email.com", password: "StrongP@ssw0rd!" })
      .expect(201);
    await request(app.getHttpServer())
      .post("/users")
      .send({ name: "Test User", email: "test2@email.com", password: "StrongP@ssw0rd!" })
      .expect(409);
  });

  it("/users/social (POST) - conflict on email with another method", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .send({ name: "Test User", email: "test3@email.com", password: "StrongP@ssw0rd!" })
      .expect(201);
    await request(app.getHttpServer())
      .post("/users/social")
      .send({ name: "Social User", email: "test3@email.com", provider: "google", providerId: "zzz" })
      .expect(409);
  });

  describe("GET /users (findAll)", () => {
    beforeAll(async () => {
      // Seed users for findAll
      await request(app.getHttpServer())
        .post("/users")
        .send({ name: "A", email: "a@a.com", password: "StrongP@ssw0rd!" });
      await request(app.getHttpServer())
        .post("/users")
        .send({ name: "B", email: "b@b.com", password: "StrongP@ssw0rd!" });
    });

    it("should return paginated, filtered and sorted users", async () => {
      const res = await request(app.getHttpServer())
        .get("/users?page=1&limit=1&sortBy=name&order=asc")
        .expect(200);
      interface FindAllResponse {
        users: { name: string }[]; count: number
      }
      const body = res.body as FindAllResponse;
      expect(body).toBeDefined();
      expect(Array.isArray(body.users)).toBe(true);
      expect(typeof body.count).toBe("number");
      if (body.users.length > 0) {
        expect(typeof body.users[0].name).toBe("string");
      }
    });
  });

  describe("GET /users/:id (findOne)", () => {
    let createdId: string;

    interface FindOneResponse {
      id: string;
    }

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post("/users")
        .send({ name: "FindOne User", email: "findone@email.com", password: "StrongP@ssw0rd!" })
        .expect(201);

      const body = res.body as FindOneResponse;
      createdId = body.id;
    });

    it("should return user by id", async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${createdId}`)
        .expect(200);
      expect(res.body).toHaveProperty("id", createdId);
      expect(res.body).toHaveProperty("email", "findone@email.com");
      expect(res.body).toHaveProperty("name", "FindOne User");
    });

    it("should return 404 if user not found", async () => {
      await request(app.getHttpServer())
        .get("/users/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("GET /users (findAllInactive)", () => {
    interface FindAllResponse {
      users: { lastLogin: Date }[]; count: number
    }

    beforeAll(async () => {
      // Seed users for findAll
      await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "A",
          email: "a@a.com",
          password: "StrongP@ssw0rd!",
        });
      await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "Inactive User",
          email: "inactive@email.com",
          password: "StrongP@ssw0rd!",
        });

      const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
      await userRepo.update(
        { email: "inactive@email.com" },
        { lastLogin: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) }, // 31 days ago
      );
    });

    it("should return all inactive users (never logged or inactive)", async () => {
      const res = await request(app.getHttpServer())
        .get("/users/inactive")
        .expect(200);

      const body = res.body as FindAllResponse;

      expect(body).toHaveProperty("users");
      expect(Array.isArray(body.users)).toBe(true);

      expect(body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ lastLogin: null }),
          expect.objectContaining({ lastLogin: expect.any(String) as string }),
        ]),
      );
    });

    it("should return only never logged users", async () => {
      const res = await request(app.getHttpServer())
        .get("/users/inactive?neverLogged=true")
        .expect(200);

      const body = res.body as FindAllResponse;

      expect(body).toHaveProperty("users");
      expect(Array.isArray(body.users)).toBe(true);

      expect(body.users.every((u) => u.lastLogin === null)).toBe(true);
    });

    it("should return only inactive users who have logged in before", async () => {
      const res = await request(app.getHttpServer())
        .get("/users/inactive?neverLogged=false")
        .expect(200);

      const body = res.body as FindAllResponse;

      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      expect(body).toHaveProperty("users");
      expect(Array.isArray(body.users)).toBe(true);

      expect(body.users.every((u) => u.lastLogin !== null)).toBe(true);
      expect(body.users.every(
        (u) => new Date().getTime() - new Date(u.lastLogin).getTime() > THIRTY_DAYS,
      )).toBe(true);
    });
  });
});
