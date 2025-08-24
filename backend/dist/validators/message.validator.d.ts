import Joi from "joi";
export declare const messageSchema: Joi.ObjectSchema<any>;
export declare const messageContentOnlySchema: Joi.StringSchema<string>;
export declare const conversationIdParamSchema: Joi.ObjectSchema<any>;
export declare const userIdParamSchema: Joi.ObjectSchema<any>;
export declare const groupConversationSchema: Joi.ObjectSchema<any>;
export declare const conversationParticipantParamSchema: Joi.ObjectSchema<any>;
export declare const messageQuerySchema: Joi.ObjectSchema<any>;
export declare const validateInput: <T>(schema: Joi.ObjectSchema, data: any) => {
    value: T;
    error?: string;
};
//# sourceMappingURL=message.validator.d.ts.map