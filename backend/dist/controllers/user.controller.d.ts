import type { NextFunction, Request, Response } from "express";
export declare const getAllUsers: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUserById: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUserByUsername: (req: Request, res: Response, next: NextFunction) => void;
export declare const getCurrentUser: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateCurrentUserProfile: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateOnlineStatus: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUserStats: (req: Request, res: Response, next: NextFunction) => void;
export declare const searchUsers: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUsersForConversation: (req: Request, res: Response, next: NextFunction) => void;
export declare const getUsersOnline: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map