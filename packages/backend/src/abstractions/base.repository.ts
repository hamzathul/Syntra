export abstract class BaseRepository<TEntity, TIdentifier> {
  abstract findById(identifier: TIdentifier): Promise<TEntity | null>;

  async exists(identifier: TIdentifier): Promise<boolean> {
    return (await this.findById(identifier)) !== null;
  }
}
