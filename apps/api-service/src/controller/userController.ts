import { Request, Response, NextFunction } from "express";
import * as userService from "../service/userService";

// const parseJsonFields = (obj: any, fields: string[]) => {
//   const parsedObj = { ...obj };
//   fields.forEach((field) => {
//     if (typeof parsedObj[field] === "string") {
//       try {
//         parsedObj[field] = JSON.parse(parsedObj[field]);
//       } catch (error) {
//         console.error(`Error parsing ${field}:`, error);
//         parsedObj[field] = [];
//       }
//     }
//   });
//   return parsedObj;
// };

export const getAllUsers = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    // res.json(users.map((user) => parseJsonFields(user, ["roles"])));
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    // res.json(parseJsonFields(user, ["roles"]));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, profilePicture, banned, roles } = req.body;
    const newUser = await userService.createUser({
      name,
      profilePicture,
      banned,
      roles: roles || [],
    });
    // res.status(201).json(parseJsonFields(newUser, ["roles"]));
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, profilePicture, banned, roles } = req.body;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userService.updateUser(id, {
      name,
      profilePicture,
      banned,
      roles,
    });

    // ban or unban user
    if (updatedUser.banned !== user.banned) {
      if (updatedUser.banned) {
        // send ws message to all clients
        // update comments status of the user
        // force update the player clent
      } else {
      }
    }

    // res.json(parseJsonFields(updatedUser, ["roles"]));
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      next(error);
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
