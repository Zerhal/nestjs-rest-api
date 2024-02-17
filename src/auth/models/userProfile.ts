import { Roles } from '@prisma/client';
export interface UserProfile {
  id: string;
  email: string;
  roles: Roles[];
  createdAt: Date;
  updatedAt: Date;
}
