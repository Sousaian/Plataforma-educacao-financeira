import { createStorageRepository } from "@/lib/data/repository"
import { createLocalStorage } from "@/lib/data/storage"
import { createEduService } from "./edu-service"

export { createEduService, EMPTY_SNAPSHOT, type EduService, type EduSnapshot } from "./edu-service"

/** Instância única do app, persistida no localStorage do navegador. */
export const eduService = createEduService({ repository: createStorageRepository(createLocalStorage()) })
