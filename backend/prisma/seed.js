import 'dotenv/config'; import bcrypt from 'bcryptjs'; import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
const email=(process.env.ADMIN_EMAIL||'admin@perusahaan.local').toLowerCase();
const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD||'Admin123!Ganti',12);
const admin=await prisma.user.upsert({where:{email},update:{name:process.env.ADMIN_NAME||'Administrator',role:'ADMIN',isActive:true,isEmailVerified:true},create:{name:process.env.ADMIN_NAME||'Administrator',email,passwordHash,role:'ADMIN',isActive:true,isEmailVerified:true}});
const count=await prisma.publication.count();
if(!count) await prisma.publication.create({data:{title:'Selamat datang di Pusat Info',summary:'Panduan singkat penggunaan portal informasi karyawan.',content:'Baca informasi pada kartu, lalu tandai Sudah Dibaca dan Sudah Dipahami. Admin dapat melihat rekap per publikasi.',status:'PUBLISHED',publishedAt:new Date(),createdById:admin.id}});
console.log('Seed selesai:',email); await prisma.$disconnect();
