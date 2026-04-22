import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    const wantsJson = req.originalUrl.startsWith('/api/');

    if (!token) {
        if (wantsJson) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
        if (wantsJson) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.redirect('/');
    }
}
