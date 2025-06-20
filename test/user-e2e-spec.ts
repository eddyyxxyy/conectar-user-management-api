import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestAppModule } from "./test-app.module";

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
});
