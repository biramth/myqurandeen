import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../../modules/auth/dto/register.dto";
import { LoginDto } from "../../modules/auth/dto/login.dto";
import { ToggleBookmarkDto } from "../../modules/user-data/dto/toggle-bookmark.dto";
import { CreateNoteDto } from "../../modules/user-data/dto/create-note.dto";
import { UpdateNoteDto } from "../../modules/user-data/dto/update-note.dto";
import { CreateCollectionDto } from "../../modules/user-data/dto/create-collection.dto";
import { RecordLastReadDto } from "../../modules/user-data/dto/record-last-read.dto";

/** Valide une instance via class-validator, comme le fait le ValidationPipe global (whitelist:true, forbidNonWhitelisted:true). */
async function validateDto(cls: new () => object, data: Record<string, unknown>): Promise<string[]> {
  const instance = plainToInstance(cls, data);
  const errors = await validate(instance as object, { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
}

async function isValid(cls: new () => object, data: Record<string, unknown>): Promise<boolean> {
  return (await validateDto(cls, data)).length === 0;
}

describe("RegisterDto", () => {
  it("accepte des identifiants valides", async () => {
    await expect(
      isValid(RegisterDto, { email: "user@example.com", password: "motdepasse", displayName: "Ali" }),
    ).resolves.toBe(true);
  });

  it("rejette un email mal forme", async () => {
    expect(await validateDto(RegisterDto, { email: "pas-un-email", password: "motdepasse", displayName: "Ali" })).toContain("email");
  });

  it("rejette un mot de passe trop court (< 8)", async () => {
    expect(await validateDto(RegisterDto, { email: "u@e.com", password: "court", displayName: "Ali" })).toContain("password");
  });

  it("rejette un mot de passe trop long (> 72)", async () => {
    expect(await validateDto(RegisterDto, { email: "u@e.com", password: "x".repeat(73), displayName: "Ali" })).toContain("password");
  });

  it("rejette un nom affiche trop court (< 2)", async () => {
    expect(await validateDto(RegisterDto, { email: "u@e.com", password: "motdepasse", displayName: "A" })).toContain("displayName");
  });

  it("rejette les proprietes inconnues (forbidNonWhitelisted)", async () => {
    expect(await validateDto(RegisterDto, { email: "u@e.com", password: "motdepasse", displayName: "Ali", hack: true })).toContain("hack");
  });
});

describe("LoginDto", () => {
  it("accepte email + mot de passe", async () => {
    await expect(isValid(LoginDto, { email: "u@e.com", password: "motdepasse" })).resolves.toBe(true);
  });

  it("rejette un mot de passe non fourni", async () => {
    expect(await validateDto(LoginDto, { email: "u@e.com" })).toContain("password");
  });
});

describe("ToggleBookmarkDto", () => {
  it("accepte un targetType connu et un UUID", async () => {
    await expect(
      isValid(ToggleBookmarkDto, { targetType: "verse", targetId: "00000000-0000-4000-8000-000000000000", localDate: "2026-09-03" }),
    ).resolves.toBe(true);
  });

  it("rejette un targetType inconnu", async () => {
    expect(await validateDto(ToggleBookmarkDto, { targetType: "poeme", targetId: "00000000-0000-4000-8000-000000000000" })).toContain("targetType");
  });

  it("rejette un targetId qui n'est pas un UUID", async () => {
    expect(await validateDto(ToggleBookmarkDto, { targetType: "verse", targetId: "abc" })).toContain("targetId");
  });

  it("localDate est optionnel, mais s'il est fourni doit etre YYYY-MM-DD", async () => {
    expect(await validateDto(ToggleBookmarkDto, { targetType: "hadith", targetId: "00000000-0000-4000-8000-000000000000" })).not.toContain("localDate");
    expect(await validateDto(ToggleBookmarkDto, { targetType: "hadith", targetId: "00000000-0000-4000-8000-000000000000", localDate: "03/09/2026" })).toContain("localDate");
  });
});

describe("CreateNoteDto", () => {
  it("accepte une note valide", async () => {
    await expect(
      isValid(CreateNoteDto, { targetType: "verse", targetId: "00000000-0000-4000-8000-000000000000", content: "Tafsir utile", isPrivate: true }),
    ).resolves.toBe(true);
  });

  it("rejette un contenu vide", async () => {
    expect(await validateDto(CreateNoteDto, { targetType: "verse", targetId: "00000000-0000-4000-8000-000000000000", content: "" })).toContain("content");
  });

  it("rejette isPrivate non booleen", async () => {
    expect(await validateDto(CreateNoteDto, { targetType: "verse", targetId: "00000000-0000-4000-8000-000000000000", content: "x", isPrivate: "oui" })).toContain("isPrivate");
  });
});

describe("UpdateNoteDto", () => {
  it("accepte un contenu avec isPrivate optionnel", async () => {
    await expect(isValid(UpdateNoteDto, { content: "Mis a jour" })).resolves.toBe(true);
    await expect(isValid(UpdateNoteDto, { content: "Mis a jour", isPrivate: false })).resolves.toBe(true);
  });
});

describe("CreateCollectionDto", () => {
  it("accepte un nom seul (description optionnelle)", async () => {
    await expect(isValid(CreateCollectionDto, { name: "Mes sourates preferees" })).resolves.toBe(true);
  });

  it("rejette un nom vide ou trop long (> 150)", async () => {
    expect(await validateDto(CreateCollectionDto, { name: "" })).toContain("name");
    expect(await validateDto(CreateCollectionDto, { name: "x".repeat(151) })).toContain("name");
  });
});

describe("RecordLastReadDto", () => {
  it("accepte un targetType connu + UUID", async () => {
    await expect(
      isValid(RecordLastReadDto, { targetType: "verse", targetId: "00000000-0000-4000-8000-000000000000" }),
    ).resolves.toBe(true);
  });

  it("rejette un targetType hors de TARGET_TYPES", async () => {
    expect(await validateDto(RecordLastReadDto, { targetType: "surah", targetId: "00000000-0000-4000-8000-000000000000" })).toContain("targetType");
  });
});
