const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
//
const dotenv = require('dotenv');

// Only register the Google strategy when credentials are present.
// In test environments dotenv is not loaded, so GOOGLE_CLIENT_ID is undefined
// and the strategy constructor would throw. Guard here to keep the test suite clean.

//
dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
        // Trust X-Forwarded-Proto from Vercel's proxy so Passport builds the
        // callback URL with https://, matching what's registered in Google Cloud Console.
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email    = profile.emails?.[0]?.value?.toLowerCase();

          // 1. Existing Google-linked account
          let user = await User.findOne({ googleId });
          if (user) return done(null, user);

          // 2. Existing local account with the same email → link it
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              await user.save();
              return done(null, user);
            }
          }

          // 3. Brand-new user — create a passwordless account
          const displayName = profile.displayName || '';

          // Derive a clean base from displayName, falling back to email prefix, then 'user'
          const emailPrefix = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : '';
          const rawBase = displayName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
            || emailPrefix
            || 'user';
          // Ensure base is at least 3 chars so username always satisfies minlength: 3
          const base = rawBase.slice(0, 16).toLowerCase().padEnd(3, '_');

          // Use a random 6-char hex suffix to avoid collisions (16^6 = ~16M slots)
          const suffix   = Math.random().toString(16).slice(2, 8);
          const username = `${base}_${suffix}`;

          user = new User({
            username,
            email:    email || `${googleId}@google.invalid`,
            googleId,
            // passwordHash intentionally omitted — social login
          });
          await user.save();

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Ledgic uses stateless JWT cookies — no session serialization needed.
// These stubs satisfy Passport's internal checks without enabling sessions.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
