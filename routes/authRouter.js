import db, { sql } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query(
      sql`SELECT * from profiles WHERE email = ${email}`
    );

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    bcrypt.compare(password, user.password, async (err, result) => {
      if (err) {
        return res.status(500).send("Error comparing passwords");
      } else if (!result) {
        return res.status(401).send("Invalid password");
      } else {
        // Generate tokens
        const accessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        // Insert tokens into the profiles table
        await db.query(
          sql`UPDATE profiles SET accessToken = ${accessToken}, refreshToken = ${refreshToken} WHERE email = ${email}`
        );
        delete user.password;
        // Return user information along with tokens
        const accountResult = { ...user, accessToken, refreshToken };
        return res.status(200).send(accountResult);
      }
    });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});

authRouter.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("Refresh token is required");
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Fetch the user from the database
    const [user] = await db.query(
      sql`SELECT * from profiles WHERE id = ${decoded.id}`
    );

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).send("Invalid refresh token");
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Update the database with the new tokens
    await db.query(
      sql`UPDATE profiles SET accessToken = ${newAccessToken}, refreshToken = ${newRefreshToken} WHERE id = ${user.id}`
    );

    // Send the new tokens in the response
    return res
      .status(200)
      .send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});

authRouter.post("/logout", async (req, res) => {
  const { id } = req.body;

  try {
    // Update the database to remove the tokens
    await db.query(
      sql`UPDATE profiles SET accessToken = NULL, refreshToken = NULL WHERE id = ${id}`
    );

    return res.status(200).send("Logged out successfully");
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});
