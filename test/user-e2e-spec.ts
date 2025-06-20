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
});
