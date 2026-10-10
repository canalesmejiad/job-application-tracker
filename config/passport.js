const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

function configurePassport() {
    const requiredVariables = [
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
        "GITHUB_CALLBACK_URL",
    ];

    const missingVariables = requiredVariables.filter(
        (variable) => !process.env[variable]
    );

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing OAuth environment variables: ${missingVariables.join(", ")}`
        );
    }

    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
                state: true,
            },
            (accessToken, refreshToken, profile, done) => {
                const user = {
                    id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName || profile.username,
                    profileUrl: profile.profileUrl,
                    avatarUrl: profile.photos?.[0]?.value || null,
                };

                return done(null, user);
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}

module.exports = {
    configurePassport,
    passport,
};