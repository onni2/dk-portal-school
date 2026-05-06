export interface DuoPhone {
  phone_id: string;
  number: string;
  name: string;
  model: string;
  type: string;
  platform: string;
  activated: boolean;
  last_seen?: string;
}

export interface DuoUser {
  user_id: string;
  username: string;
  realname: string;
  email: string;
  status: string;
}

export interface DuoStatus {
  user: DuoUser;
  phones: DuoPhone[];
}
