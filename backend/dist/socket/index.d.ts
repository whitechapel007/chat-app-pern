import { Server } from "socket.io";
declare module "socket.io" {
    interface Socket {
        user?: {
            id: string;
            username: string;
            email: string;
            fullName: string;
        };
    }
}
export declare const getUserSocketId: (userId: string) => string | undefined;
export declare const getOnlineUsers: () => string[];
export declare const isUserOnline: (userId: string) => boolean;
export declare const getIoInstance: () => Server | null;
export declare const sendToUser: (userId: string, event: string, data: any) => boolean;
export declare const sendToUsers: (userIds: string[], event: string, data: any) => string[];
export declare const broadcastToAll: (event: string, data: any) => void;
declare function createSocket(io: Server): void;
export { createSocket };
//# sourceMappingURL=index.d.ts.map