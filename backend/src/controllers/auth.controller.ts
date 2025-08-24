import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import * as authService from "../services/auth.services.js";
import { formatSuccessResponse } from "../utils/errors.js";

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.signup(req.body);

    // Set HTTP-only cookie for token (more secure than localStorage)
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    res
      .status(201)
      .json(
        formatSuccessResponse(
          { user: result.user, token: result.token },
          "Account created successfully"
        )
      );
  }
);

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.signin(req.body);

    // Set HTTP-only cookie for token
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    res
      .status(200)
      .json(
        formatSuccessResponse(
          { user: result.user, token: result.token },
          "Signed in successfully"
        )
      );
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    await authService.logout(req.user.id);

    // Clear the token cookie
    res.clearCookie("token");

    res
      .status(200)
      .json(formatSuccessResponse(null, "Logged out successfully"));
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const result = await authService.changePassword(req.user.id, req.body);

    res.status(200).json(formatSuccessResponse(null, result.message));
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated", statusCode: 401 },
      });
    }

    const user = await authService.getUserProfile(req.user.id);

    res
      .status(200)
      .json(formatSuccessResponse(user, "Profile retrieved successfully"));
  }
);

// Legacy function names for backward compatibility
export const login = signin;
