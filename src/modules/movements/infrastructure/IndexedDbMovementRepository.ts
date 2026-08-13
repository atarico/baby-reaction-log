import type { Movement } from '../domain/Movement.ts'
import type { MovementRepository } from '../domain/MovementRepository.ts'

const DATABASE_VERSION = 1
const STORE = 'movements'
const BY_OCCURRED_AT = 'by-occurred-at'

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const transactionToPromise = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error)
    transaction.onerror = () => reject(transaction.error)
  })

export class IndexedDbMovementRepository implements MovementRepository {
  private connection: Promise<IDBDatabase> | null = null
  private readonly databaseName: string

  // Do NOT rename this default to match the product name: the string IS the
  // storage key. Changing it opens a fresh, empty database and orphans every
  // reaction already logged on the device.
  constructor(databaseName = 'baby-moves') {
    this.databaseName = databaseName
  }

  async save(movement: Movement): Promise<void> {
    await this.write((store) => store.put(movement))
  }

  async findAll(): Promise<Movement[]> {
    const database = await this.open()
    const transaction = database.transaction(STORE, 'readonly')
    const ascending = await requestToPromise<Movement[]>(
      transaction.objectStore(STORE).index(BY_OCCURRED_AT).getAll(),
    )

    return ascending.reverse()
  }

  async delete(id: string): Promise<void> {
    await this.write((store) => store.delete(id))
  }

  async clear(): Promise<void> {
    await this.write((store) => store.clear())
  }

  close(): void {
    const connection = this.connection
    this.connection = null
    void connection?.then((database) => database.close())
  }

  private async write(operation: (store: IDBObjectStore) => IDBRequest): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction(STORE, 'readwrite')

    operation(transaction.objectStore(STORE))

    await transactionToPromise(transaction)
  }

  private open(): Promise<IDBDatabase> {
    this.connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, DATABASE_VERSION)

      request.onupgradeneeded = () => {
        const database = request.result

        if (!database.objectStoreNames.contains(STORE)) {
          database
            .createObjectStore(STORE, { keyPath: 'id' })
            .createIndex(BY_OCCURRED_AT, 'occurredAt')
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    return this.connection
  }
}
