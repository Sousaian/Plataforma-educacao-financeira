import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { listAvatarOptions } from "@/lib/domain/catalog"

describe("catálogo de avatares", () => {
  it.each(listAvatarOptions())("$id possui imagem em public", ({ src }) => {
    expect(existsSync(resolve(process.cwd(), "public", src.slice(1)))).toBe(true)
  })

  it("preserva ids e patentes dos avatares premium", () => {
    expect(listAvatarOptions().filter(({ free }) => !free)).toMatchObject([
      { id: "av7", src: "/images/avatars/avatar-7.svg", requiredPatentName: "Ouro", requiredPatentIndex: 3 },
      { id: "av8", src: "/images/avatars/avatar-8.svg", requiredPatentName: "Diamante", requiredPatentIndex: 4 },
    ])
  })
})
