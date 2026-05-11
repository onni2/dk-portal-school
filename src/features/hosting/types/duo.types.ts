export interface DuoUser {
  duoUserId: string;
  hostingAccountId: string;
  hostingUsername: string;
  username: string;
  displayName: string;
  email: string | null;
  emailStatus: string;
  status: string | null;
}

export interface DuoDevice {
  deviceId: string;
  description: string;
  type: string;
  platform: string | null;
  model: string | null;
  phoneNumber: string | null;
  status: "pending_activation" | "active" | "removed" | string;
  activationUrl: string | null;
  activationBarcode: string | null;
  activationExpiresAt: string | null;
  createdAt: string;
}

export interface CreateDuoDevicePayload {
  phoneNumber: string;
  platform: "ios" | "android";
  deviceDescription: string;
  activationMethod: "sms" | "qr";
}

export interface CreateDuoDeviceResponse {
  ok: true;
  deviceId: string;
  phoneNumber: string;
  deviceDescription: string;
  platform: string | null;
  status: "pending_activation" | "active" | string;
  activationMethod: "sms" | "qr";
  smsSent: boolean;
  activationUrl: string | null;
  activationBarcode: string | null;
  activationExpiresAt: string | null;
  validSeconds: number;
}

export interface DuoDeviceStatusResponse {
  activated: boolean;
  status: "pending_activation" | "active" | string;
  model: string | null;
  platform: string | null;
}

export interface UpdateDuoUserPayload {
  displayName?: string;
  email?: string;
}

export interface UpdateDuoUserResponse {
  ok: true;
  duoUserId: string;
  displayName: string | null;
  email: string | null;
  emailStatus: string | null;
}