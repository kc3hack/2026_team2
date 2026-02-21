/**
 * アプリケーション設定
 */
export const AppConfig = {
  /**
   * サーバーのホスト名またはIPアドレス
   * 開発環境では、ローカルネットワークのIPアドレスを指定
   */
  serverHostname: "192.168.0.21",

  /**
   * サーバーのポート番号
   */
  serverPort: 8080,

  /**
   * サーバーのベースURL
   */
  get serverBaseUrl() {
    return `http://${this.serverHostname}:${this.serverPort}`;
  },
} as const;
