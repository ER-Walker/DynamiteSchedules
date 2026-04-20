import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log('JWT verify error:', err.message);
        res.clearCookie('token');
        return res.redirect('/');
    }
}