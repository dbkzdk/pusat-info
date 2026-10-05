import crypto from 'crypto'; import jwt from 'jsonwebtoken'; import nodemailer from 'nodemailer'; import { PrismaClient } from '@prisma/client';
export const prisma=new PrismaClient();
export const hashToken=v=>crypto.createHash('sha256').update(v).digest('hex');
export const signToken=user=>jwt.sign({sub:user.id,role:user.role,name:user.name},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
export async function sendMail({to,subject,html}){ if(!process.env.SMTP_HOST){console.log('[EMAIL DEV]',{to,subject,html});return;} const t=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE)==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}); await t.sendMail({from:process.env.MAIL_FROM,to,subject,html}); }
export const asyncHandler=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
