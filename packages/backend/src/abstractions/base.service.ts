export abstract class BaseService {
  protected constructor(protected readonly serviceName: string) {}

  get name(): string {
    return this.serviceName;
  }
}
