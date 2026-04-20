import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { registerSchema, loginSchema } from "./auth.schema";
import { hashPassword, comparePassword } from "../lib/hash";
import { sendEmail, sendEmailWithTemplate } from "../lib/email";
import {
  createAccessToken,
  createRfreshToken,
  verifyRefreshToken,
} from "../lib/token";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { email } from "zod";

function getAppUrl() {
  return process.env.APP_URL || `http:localhost:${process.env.PORT || 5000}`;
}

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUrl = process.env.GOOGLE_REDIRECT_URL;

  if (!clientId || !clientSecret) {
    throw new Error("Google client is not found.");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUrl);
}

export async function register(req: Request, res: Response) {
  try {
    const result = registerSchema().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }

    const { name, email, password } = result.data;

    const normalizedEmail = email.toLocaleLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message:
          "User with this emailis already exixts. Please try again with other email.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newlyCreatedUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
    });

    const verifyToken = jwt.sign(
      {
        sub: newlyCreatedUser._id,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    const verificationLink = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;

    await sendEmailWithTemplate(
      newlyCreatedUser.email,
      "Verify your email address",
      "email-verification",
      {
        name: newlyCreatedUser.name,
        verificationLink,
      },
    );

    return res.status(201).json({
      message: "User registered successfullr.",
      user: {
        id: newlyCreatedUser._id,
        name: newlyCreatedUser.name,
        email: newlyCreatedUser.email,
        role: newlyCreatedUser.role,
        isEmailVerified: newlyCreatedUser.isEmailVerified,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
    console.log(err);
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string | undefined;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is missing.",
    });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
    };
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({
        message: "User is no found.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "User email is already verifiyed.",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Now user is Verified. Ypu can login.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = loginSchema().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }

    const { email, password } = result.data;

    const normalizedEmail = email.toLocaleLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message:
          "There is no user registered with this email. Please try again with other email.",
      });
    }

    const passwordMatchs = await comparePassword(password, user.password);

    if (!passwordMatchs) {
      return res.status(400).json({
        message:
          "You entered incorrect password. Please try again with correct email.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
      });
    }

    const accessToken = createAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion,
    );
    const refreshToken = createRfreshToken(
      user._id.toString(),
      user.tokenVersion,
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/" });
  return res.status(200).json({
    message: "Login out successfully",
  });
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({
        message: "Token is missing. Please login to continue.",
      });
    }

    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(400).json({
        message: "User is not found.",
      });
    }

    const newAccessToken = createAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion,
    );

    const newRefreshToken = createRfreshToken(
      user._id.toString(),
      user.tokenVersion,
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token refreshed successfully.",
      newAccessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({
      message: "Please enter your email to continue.",
    });
  }

  const normalizedEmail = email.toLocaleLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        message:
          "If the user registered with this email the user will recieve a reset password link.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetPasswordLink = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `
      <p>reset your password.</p>
      <a href="${resetPasswordLink}">Reset Password</a>
      `,
    );

    return res.status(200).json({
      message:
        "If the user registered with this email the user will recieve a reset password link.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({
      message: "Token and password are required.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Invalid password. Password must be at least 6 characters long.",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "User is not found.",
      });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion += 1;

    await user.save();

    return res.status(200).json({
      message: "Password rest successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function googleAuthStarter(req: Request, res: Response) {
  try {
    const client = getGoogleClient();

    const url = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    });

    return res.redirect(url);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}

export async function googleAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.status(400).json({
      message: "Code is missing.",
    });
  }
  try {
    const client = getGoogleClient();

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({
        message: "Id token is missing.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;

    if (!email || !emailVerified) {
      return res.status(400).json({
        message: "Invalid email or email is not verified",
      });
    }

    const normalizedEmail = email.toLocaleLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const password = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await hashPassword(password);

      user = await User.create({
        name: payload?.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        isEmailVerified: true,
      });
    }

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const refreshToken = createRfreshToken(user.id, user.tokenVersion);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful.",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error occured. Please try again later,",
    });
  }
}
