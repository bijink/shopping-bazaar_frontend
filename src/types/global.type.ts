export type User = {
  _id: string;
  role: string;
  fname: string;
  lname: string;
  email: string;
};

export interface NamedBlob extends Blob {
  name?: string;
}
