interface UpdateUserProfileData {
    fullName?: string;
    profilePic?: string;
}
interface GetUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    excludeUserId?: string;
}
export declare const getAllUsers: (options?: GetUsersOptions) => Promise<{
    users: {
        id: string;
        username: string;
        email: string;
        fullName: string;
        gender: import(".prisma/client").$Enums.Gender;
        profilePic: string;
        isOnline: boolean;
        lastSeen: Date;
        createdAt: Date;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const getUserById: (userId: string) => Promise<{
    id: string;
    username: string;
    email: string;
    fullName: string;
    gender: import(".prisma/client").$Enums.Gender;
    profilePic: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getUserByUsername: (username: string) => Promise<{
    id: string;
    username: string;
    email: string;
    fullName: string;
    gender: import(".prisma/client").$Enums.Gender;
    profilePic: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
}>;
export declare const updateUserProfile: (userId: string, data: UpdateUserProfileData) => Promise<{
    id: string;
    username: string;
    email: string;
    fullName: string;
    gender: import(".prisma/client").$Enums.Gender;
    profilePic: string;
    isOnline: boolean;
    lastSeen: Date;
    updatedAt: Date;
}>;
export declare const updateUserOnlineStatus: (userId: string, isOnline: boolean) => Promise<{
    id: string;
    username: string;
    isOnline: boolean;
    lastSeen: Date;
}>;
export declare const getUserStats: (userId: string) => Promise<{
    conversationsCount: number;
    messagesSentCount: number;
}>;
export declare const searchUsers: (query: string, excludeUserId?: string, limit?: number) => Promise<{
    id: string;
    username: string;
    fullName: string;
    profilePic: string;
    isOnline: boolean;
}[]>;
export {};
//# sourceMappingURL=user.services.d.ts.map