export interface AppIcon {
  id?: number;
  appName: string;
  packageName: string;
  packageVersion: string;
  appIconBase64: string;
  updatedAt?: number;
}

export interface AppInfo {
  packageName: string;
  packageVersion: string;
}