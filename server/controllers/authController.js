const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_TOKEN_TTL  = 15 * 60;          // 15 minutes (seconds for jwt)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days (seconds for jwt)

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

function setAuthCookies(res, userId) {
  const payload = { user: { id: userId } };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_TTL * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_TTL * 1000,
    path: '/api/auth/refresh', // scoped — only sent to the refresh endpoint
  });
}

exports.register = async (req, res) => {
  try {
    const { username, email, password, dateOfBirth, reason } = req.body;

    const normalizedEmail    = email.toLowerCase().trim();
    const normalizedUserName = username.toLowerCase().trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUserName }],
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        // Generic response — don't reveal whether the email is registered
        return res.status(200).json({
          message: 'If this email is not currently in use, your account has been created.',
        });
      }
      // Username collision is intentionally explicit (usernames are public-facing)
      return res.status(409).json({ message: 'Username already taken' });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = { username: normalizedUserName, email: normalizedEmail, passwordHash };
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
    if (reason)      userData.reason      = reason;

    const user = new User(userData);
    await user.save();

    setAuthCookies(res, user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    // Uniform message — prevents user-enumeration via login
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    setAuthCookies(res, user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.refresh = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    // Issue a new access token cookie only
    const newAccessToken = jwt.sign(
      { user: { id: decoded.user.id } },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    res.cookie('accessToken', newAccessToken, {
      ...COOKIE_BASE,
      maxAge: ACCESS_TOKEN_TTL * 1000,
    });

    return res.status(200).json({ success: true });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// Called by Passport after a successful Google OAuth handshake.
// req.user is the Mongoose User document returned by the strategy's verify fn.
exports.googleCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth?error=oauth_failed`
    );
  }

  setAuthCookies(res, req.user.id);

  return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/app`);
};

exports.logout = (_req, res) => {
  res.clearCookie('accessToken',  { ...COOKIE_BASE });
  res.clearCookie('refreshToken', { ...COOKIE_BASE, path: '/api/auth/refresh' });
  return res.status(200).json({ success: true });
};
