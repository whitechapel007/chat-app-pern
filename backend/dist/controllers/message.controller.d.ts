import type { NextFunction, Request, Response } from "express";
export declare const getConversations: (req: Request, res: Response, next: NextFunction) => void;
export declare const sendDirectMessage: (req: Request, res: Response, next: NextFunction) => void;
export declare const sendImageMessage: (req: Request, res: Response, next: NextFunction) => void;
export declare const sendImageToConversation: (req: Request, res: Response, next: NextFunction) => void;
export declare const sendMessage: (req: Request, res: Response, next: NextFunction) => void;
export declare const getMessages: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteMessage: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateMessage: (req: Request, res: Response, next: NextFunction) => void;
export declare const conversations: (req: Request, res: Response, next: NextFunction) => void;
export declare const createGroupConversation: (req: Request, res: Response, next: NextFunction) => void;
export declare const addParticipantToGroup: (req: Request, res: Response, next: NextFunction) => void;
export declare const removeParticipantFromGroup: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateGroupConversation: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=message.controller.d.ts.map