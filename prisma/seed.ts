import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create Super Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@imh.ba';
  const adminPassword = await bcrypt.hash('admin123', 10); // Default password, change in prod

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Super Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 2. Create Initial Parameters (Version 2026-03)
  const params = await prisma.parametriPlata.upsert({
    where: { verzija: '2026-03' },
    update: {},
    create: {
      verzija: '2026-03',
      efektivanOd: new Date('2026-03-01'),
      doprinosiIzPlate: 0.31,
      doprinosiNaPlatu: 0.105,
      porezStopa: 0.10,
      licniOdbitak: 800.00,
      topliObrok: 180.00,
      minimalnaPlata: 619.00, // FBiH minimum 2024/2025 approx
      aktivan: true,
      kreiraoId: admin.id,
      kreiraoIme: admin.name || 'System',
      napomena: 'Inicijalni parametri iz USTAV-a',
    },
  });
  console.log(`Created parameters: ${params.verzija}`);

  // 3. Seed Employees (from USTAV Tabela 3)
  const employees = [
    { id: 1, ime: "Mulalić Davor", kategorija: "A", uloga: "Direktor", neto: 1600.00 },
    { id: 2, ime: "Habul Amina", kategorija: "A", uloga: "Pedagog", neto: 2600.00 },
    { id: 3, ime: "Huremović Armina", kategorija: "A", uloga: "Pedagog", neto: 1650.00 },
    { id: 4, ime: "Morić Azra", kategorija: "A", uloga: "Office Manager", neto: 1930.00 },
    { id: 5, ime: "Žutić (Velić) Majda", kategorija: "B", uloga: "Odgajatelj", neto: 1800.00 },
    { id: 6, ime: "Agić Hasandić Amela", kategorija: "B", uloga: "Odgajatelj", neto: 1700.00 },
    { id: 7, ime: "Ljuca Alma", kategorija: "B", uloga: "Odgajatelj", neto: 1550.00 },
    { id: 8, ime: "Fazlović Amela", kategorija: "B", uloga: "Odgajatelj", neto: 1700.00 },
    { id: 9, ime: "Karaga Medina", kategorija: "B", uloga: "Odgajatelj", neto: 1500.00 },
    { id: 10, ime: "Ademović Mubera", kategorija: "C", uloga: "Asistent odgajatelja", neto: 1850.00 },
    { id: 11, ime: "Rahmanović Azra", kategorija: "C", uloga: "Finansijsko-adm. saradnik", neto: 1650.00 },
    { id: 12, ime: "Šišić Elma", kategorija: "C", uloga: "Pedijatrijska sestra", neto: 1349.34 },
    { id: 13, ime: "Solak Nejra", kategorija: "C", uloga: "Pedijatrijska sestra", neto: 1350.00 },
    { id: 14, ime: "Huseinović-Katkić Edisa", kategorija: "C", uloga: "Asistent odgajatelja", neto: 1350.00 },
    { id: 15, ime: "Mujezinović Hadžić Amela", kategorija: "C", uloga: "Asistent odgajatelja", neto: 1380.00 },
    { id: 16, ime: "Begović Emina", kategorija: "D", uloga: "Glavna kuharica", neto: 1750.00 },
    { id: 17, ime: "Halilović Senida", kategorija: "D", uloga: "Pomoćna kuharica", neto: 1200.00 },
    { id: 18, ime: "Beganović Enisa", kategorija: "D", uloga: "Spremačica", neto: 1120.00 },
    { id: 19, ime: "Džidić Nizama", kategorija: "D", uloga: "Spremačica", neto: 1077.78 }
  ];

  for (const emp of employees) {
    await prisma.zaposlenik.upsert({
      where: { id: emp.id },
      update: {
        netoOsnova: emp.neto,
        kategorija: emp.kategorija,
        uloga: emp.uloga,
      },
      create: {
        id: emp.id,
        imeIPrezime: emp.ime,
        kategorija: emp.kategorija,
        uloga: emp.uloga,
        netoOsnova: emp.neto,
        datumZaposlenja: new Date('2024-01-01'), // Placeholder
        godinStaza: 0, // Placeholder
        aktivan: true,
      },
    });
  }
  console.log(`Seeded ${employees.length} employees.`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
