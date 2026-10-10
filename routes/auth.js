const express = require("express");
const { passport } = require("../config/passport");

const router = express.Router();

router.get(
    "/github",
    passport.authenticate("github", {
        scope: ["read:user"],
    })
);

router.get(
    "/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/auth/failure",
    }),
    (req, res) => {
        res.redirect("/api-docs");
    }
);

router.get("/status", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            authenticated: false,
            login: "/auth/github",
        });
    }

    return res.status(200).json({
        authenticated: true,
        user: req.user,
    });
});

router.get("/failure", (req, res) => {
    return res.status(401).json({
        error: "GitHub authentication failed",
        login: "/auth/github",
    });
});

router.post("/logout", (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((sessionError) => {
            if (sessionError) {
                return next(sessionError);
            }

            res.clearCookie("job-tracker.sid", {
                path: "/",
            });

            return res.status(200).json({
                message: "Logged out successfully",
            });
        });
    });
});

module.exports = router;