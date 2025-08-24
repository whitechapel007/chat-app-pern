import Joi from "joi";
export declare const signupSchema: Joi.ObjectSchema<any>;
export declare const signinSchema: Joi.ObjectSchema<any>;
export declare const passwordResetRequestSchema: Joi.ObjectSchema<any>;
export declare const passwordResetSchema: Joi.ObjectSchema<any>;
export declare const changePasswordSchema: Joi.ObjectSchema<any>;
export declare const updateProfileSchema: Joi.ObjectSchema<any>;
export declare const validateInput: <T>(schema: Joi.ObjectSchema, data: any) => {
    value: T;
    error?: string;
};
//# sourceMappingURL=auth.validator.d.ts.map