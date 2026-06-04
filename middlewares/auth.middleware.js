import { validateUserToken } from "../utils/token.js";

export function authenticationMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(400).json({
            error: "Authorization header must start with Bearer",
        });
    }

    const [, token] = authHeader.split(" ");

    const payload = validateUserToken(token);

    if (!payload) {
        return res.status(401).json({
            error: "Invalid token",
        });
    }

    req.user = payload;
    next();
}

export function ensureAuthenticated(req,res,next){
    if(!req.user || !req.user.id){
        return res.status(401).json({
            error: 'Must be logged in to access this resource'
        });
    }
    next();
}