import { NextFunction, Request, Response } from "express";
import { getUser } from "../services/auth";

export function checkForAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeaderValue = req.headers["authorization"];
  (req as any).user = null;

  if (
    !authorizationHeaderValue ||
    !authorizationHeaderValue?.startsWith("Bearer")
  )
    return next();

  const token = authorizationHeaderValue?.split("Bearer ")[1];
  const user = getUser(token);

  (req as any).user = user;
  next();
}

// export function restrictTo(roles: string[] = []) {
//   return function (req: Request, res: Response, next: NextFunction) {
//     if (!(req as any).user)
//       return res.status(404).json({ error: "no user found!" });
//     // console.log("R", roles);
//     // console.log((req as any).user.role);
//     // !roles.includes((req as any).user.role
//     console.log(req);
//     if (!(req as any).user.role.some((userRole:string) => roles.includes(userRole)))
//       return res.status(401).json({ error: "UnAuthorized" });

//     next();
//   };
// }

// export async function restrictToLoggedInUserOnly(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   // const userUid = req.cookies.uid; // old way domain specific.
//   const userUid = req.headers["authorization"];
//   console.log("UID", userUid);
//   if (!userUid) return res.status(404).json({ error: "not found id!" });
//   const token = userUid?.split("Bearer ")[1];
//   const user = getUser(token);
//   if (!user) return res.status(404).json({ error: "user not found!" });

//   (req as any).user = user;
//   next();
// }

// export async function checkAuth(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   // const userUid = req.cookies.uid;
//   const userUid = req.headers["authorization"];

//   console.log("UID", userUid);
//   const token = userUid?.split("Bearer ")[1];
//   const user = getUser(token);

//   (req as any).user = user;
//   next();
// }

// test

export const restrictTo =
  (roles: any[]) => async (req: Request, res: Response, next: NextFunction) => {
    console.log(roles);
    const token = await req.cookies.access_token;
    const user: any = await getUser(token);

    if (!roles.includes(user.role))
     return res.status(401).json({ error: "not authorized." });

    next();
  };


  
