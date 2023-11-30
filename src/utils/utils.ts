import { getUser } from "../services/auth";

export const getMyRole = async (token: string) => {
  const user: any = await getUser(token);

  return user && user.role === "MASTER" ? "ADMIN" : "USER";
};
export const getExactRole = async (token: string) => {
  const user: any = await getUser(token);

  return user && user.role;
};


// export const getFieldOfUser = async (token: string) => {
//   const user: any = getUser(token);
//   return user._id;
// };
