interface SignupData {
    fullname: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
}
interface SigninData {
    email: string;
    password: string;
}
interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare const signup: (data: SignupData) => Promise<{
    user: {
        id: string;
        username: string;
        email: string;
        fullName: string;
        gender: import(".prisma/client").$Enums.Gender;
        createdAt: Date;
    };
    token: string;
}>;
export declare const signin: (data: SigninData) => Promise<{
    user: {
        id: string;
        username: string;
        email: string;
        fullName: string;
        gender: import(".prisma/client").$Enums.Gender;
        isOnline: boolean;
        createdAt: Date;
    };
    token: string;
}>;
export declare const logout: (userId: string) => Promise<{
    message: string;
}>;
export declare const changePassword: (userId: string, data: ChangePasswordData) => Promise<{
    message: string;
}>;
export declare const getUserProfile: (userId: string) => Promise<{
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
export {};
//# sourceMappingURL=auth.services.d.ts.map