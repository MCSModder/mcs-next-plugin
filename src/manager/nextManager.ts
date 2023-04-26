/**
 * Next管理器
 */
export default class NextManager {
  private static _instance: NextManager;
  /**
   * Next管理器实例
   */
  public static get instance(): NextManager {
    NextManager._instance ??= new this();
    return NextManager._instance;
  }
  constructor() {}
  public addEvent() {}
}
