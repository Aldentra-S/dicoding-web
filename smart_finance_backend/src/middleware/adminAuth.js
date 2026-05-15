import jwt from 'jsonwebtoken';

const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin_secret_key';

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Token admin tidak ditemukan.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ADMIN_SECRET);
    if (decoded.role !== 'admin') {
      return res
        .status(403)
        .json({ status: 'error', message: 'Akses ditolak. Bukan admin.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Token admin tidak valid.' });
  }
};

export { authenticateAdmin };
