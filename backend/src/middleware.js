import jwt from 'jsonwebtoken';
export function auth(req,res,next){const token=req.headers.authorization?.replace('Bearer ','');if(!token)return res.status(401).json({message:'Silakan masuk.'});try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}catch{return res.status(401).json({message:'Sesi tidak valid atau kedaluwarsa.'});}}
export const role=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Akses ditolak.'});
