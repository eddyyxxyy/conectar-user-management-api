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

  describe("DELETE /users/:id (remove)", () => {
    let createdId: string;

    interface DeleteResponse {
      id: string;
    }

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "User to Delete",
          email: "delete@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(201);

      const body = res.body as DeleteResponse;

      expect(body).toHaveProperty("id");

      createdId = body.id;
    });

    it("should delete the user successfully", async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdId}`)
        .expect(204);
    });

    it("should return 404 when trying to delete non-existent user", async () => {
      await request(app.getHttpServer())
        .delete("/users/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("PATCH /users/:id (update)", () => {
    let createdId: string;

    interface UpdateResponse {
      id: string;
    }

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "User To Update",
          email: "updatable@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(201);

      const body = res.body as UpdateResponse;

      createdId = body.id;
    });

    it("should update name and role", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${createdId}`)
        .send({
          name: "Updated Name",
          role: "admin",
        })
        .expect(200);

      expect(res.body).toHaveProperty("id", createdId);
      expect(res.body).toHaveProperty("name", "Updated Name");
      expect(res.body).toHaveProperty("role", "admin");
    });

    it("should return 404 for non-existent user", async () => {
      await request(app.getHttpServer())
        .patch("/users/00000000-0000-0000-0000-000000000000")
        .send({ name: "Does not matter" })
        .expect(404);
    });

    it("should return 409 if updating to an existing email", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "Conflict User",
          email: "conflict@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/users/${createdId}`)
        .send({
          email: "conflict@email.com",
        })
        .expect(409);
    });

    it("should not allow invalid email", async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdId}`)
        .send({
          email: "invalid-email",
        })
        .expect(400);
    });

    it("should not allow invalid role", async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdId}`)
        .send({
          role: "SUPER_ADMIN",
        })
        .expect(400);
    });
  });

  describe("PATCH /users/:id/reset-password (resetPassword)", () => {
    let createdUserId: string;
    interface ResetPasswordResponse {
      id: string;
    }

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "Reset Password User",
          email: "resetpassuser@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(201);

      const body = res.body as ResetPasswordResponse;

      createdUserId = body.id;
    });

    it("should reset password successfully with strong password", async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/reset-password`)
        .send({ newPassword: "NewStrongP@ss123!" })
        .expect(204);
    });

    it("should return 400 if newPassword is weak or invalid", async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/reset-password`)
        .send({ newPassword: "weakpass" })
        .expect(400);
    });

    it("should return 404 if user does not exist", async () => {
      await request(app.getHttpServer())
        .patch("/users/00000000-0000-0000-0000-000000000000/reset-password")
        .send({ newPassword: "NewStrongP@ss123!" })
        .expect(404);
    });

    it("should return 400 if newPassword is missing", async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/reset-password`)
        .send({})
        .expect(400);
    });
  });

  describe("GET /profile (protected)", () => {
    let jwtToken: string;
    let createdUserId: string;

    interface CreateUserResponse {
      id: string;
    }

    interface LoginResponse {
      accessToken: string;
    }

    beforeAll(async () => {
      const resCreate = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "Profile User",
          email: "profileuser@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(201);

      createdUserId = (resCreate.body as CreateUserResponse).id;

      const resLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "profileuser@email.com",
          password: "StrongP@ssw0rd!",
        })
        .expect(200);

      jwtToken = (resLogin.body as LoginResponse).accessToken;
    });

    it("should return profile data with valid JWT token", async () => {
      const res = await request(app.getHttpServer())
        .get("/users/profile")
        .set("Authorization", `Bearer ${jwtToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("id", createdUserId);
      expect(res.body).toHaveProperty("email", "profileuser@email.com");
      expect(res.body).toHaveProperty("name", "Profile User");
    });

    it("should return 401 Unauthorized without token", async () => {
      await request(app.getHttpServer())
        .get("/users/profile")
        .expect(401);
    });

    it("should return 401 Unauthorized with invalid token", async () => {
      await request(app.getHttpServer())
        .get("/users/profile")
        .set("Authorization", "Bearer invalidtoken")
        .expect(401);
    });
  });
});
