import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TestAppModule } from "./test-app.module";
import { DataSource } from "typeorm";
import { User } from "../src/entities/user.entity";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
}

interface RefreshResponse {
  refreshToken: string;
  accessToken: string;
  id: string;
}

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let db: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    db = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /auth/login - should return access and refresh tokens", async () => {
    const user = new User();
    user.email = "test@email.com";
    user.name = "Test User";
    user.password = "StrongP@ssw0rd!";

    await db.getRepository(User).save(user);

    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password: "StrongP@ssw0rd!" });

    expect(res.status).toBe(200);

    const body = res.body as LoginResponse;

    expect(typeof body.id).toBe("string");
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });


  it("POST /auth/login - should return 401 with invalid credentials", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@email.com", password: "wrong" })
      .expect(401);
  });

  it("POST /auth/refresh - should return new accessToken and refreshToken", async () => {
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@email.com", password: "StrongP@ssw0rd!" });

    const loginBody = loginRes.body as LoginResponse;

    const refreshRes = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set("Authorization", `Bearer ${loginBody.refreshToken}`)
      .expect(200);

    const refreshBody = refreshRes.body as RefreshResponse & { refreshToken: string };

    expect(typeof refreshBody.accessToken).toBe("string");
    expect(typeof refreshBody.refreshToken).toBe("string");
    expect(typeof refreshBody.id).toBe("string");
  });

  it("POST /auth/refresh - should return 401 with invalid token", async () => {
    await request(app.getHttpServer())
      .post("/auth/refresh")
      .set("Authorization", "Bearer invalid.token.here")
      .expect(401);
  });

  it("GET /auth/google/login should redirect to Google", async () => {
    await request(app.getHttpServer())
      .get("/auth/google/login")
      .expect(302);
  });
});
