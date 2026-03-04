-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Zaposlenik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imeIPrezime" TEXT NOT NULL,
    "kategorija" TEXT NOT NULL,
    "uloga" TEXT NOT NULL,
    "netoOsnova" DECIMAL NOT NULL,
    "datumZaposlenja" DATETIME,
    "godinStaza" INTEGER NOT NULL DEFAULT 0,
    "aktivan" BOOLEAN NOT NULL DEFAULT true,
    "napomena" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "Ucinak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zaposlenikId" INTEGER NOT NULL,
    "godina" INTEGER NOT NULL,
    "ocjena" TEXT NOT NULL,
    "napomena" TEXT,
    "ocjenioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ucinak_zaposlenikId_fkey" FOREIGN KEY ("zaposlenikId") REFERENCES "Zaposlenik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParametriPlata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "verzija" TEXT NOT NULL,
    "efektivanOd" DATETIME NOT NULL,
    "doprinosiIzPlate" DECIMAL NOT NULL,
    "doprinosiNaPlatu" DECIMAL NOT NULL,
    "porezStopa" DECIMAL NOT NULL,
    "licniOdbitak" DECIMAL NOT NULL,
    "topliObrok" DECIMAL NOT NULL,
    "minimalnaPlata" DECIMAL NOT NULL,
    "aktivan" BOOLEAN NOT NULL DEFAULT false,
    "kreiraoId" TEXT NOT NULL,
    "kreiraoIme" TEXT NOT NULL,
    "napomena" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Obracun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "periodDatum" DATETIME NOT NULL,
    "parametriId" INTEGER NOT NULL,
    "statusObracuna" TEXT NOT NULL,
    "ukupnoNeto" DECIMAL NOT NULL,
    "ukupnoBruto1" DECIMAL NOT NULL,
    "ukupnoBruto2" DECIMAL NOT NULL,
    "ukupnoTopliObrok" DECIMAL NOT NULL,
    "ukupnoTrosak" DECIMAL NOT NULL,
    "napomena" TEXT,
    "kreiraoId" TEXT NOT NULL,
    "odobrioPotpisId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Obracun_parametriId_fkey" FOREIGN KEY ("parametriId") REFERENCES "ParametriPlata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Obracun_kreiraoId_fkey" FOREIGN KEY ("kreiraoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObracunStavka" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "obracunId" INTEGER NOT NULL,
    "zaposlenikId" INTEGER NOT NULL,
    "netoOsnova" DECIMAL NOT NULL,
    "dodatakStaz" DECIMAL NOT NULL DEFAULT 0,
    "dodVarijabilni" DECIMAL NOT NULL DEFAULT 0,
    "netoUkupno" DECIMAL NOT NULL,
    "bruto1" DECIMAL NOT NULL,
    "doprinoziIz" DECIMAL NOT NULL,
    "porezBaza" DECIMAL NOT NULL,
    "porezIznos" DECIMAL NOT NULL,
    "bruto2" DECIMAL NOT NULL,
    "topliObrok" DECIMAL NOT NULL,
    "naknPrevoz" DECIMAL NOT NULL DEFAULT 0,
    "ukupnoTrosak" DECIMAL NOT NULL,
    "napomena" TEXT,
    CONSTRAINT "ObracunStavka_obracunId_fkey" FOREIGN KEY ("obracunId") REFERENCES "Obracun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObracunStavka_zaposlenikId_fkey" FOREIGN KEY ("zaposlenikId") REFERENCES "Zaposlenik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PoslovniPodaci" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "tipPerioda" TEXT NOT NULL,
    "prihodi" DECIMAL,
    "rashodi" DECIMAL,
    "brutoPlate" DECIMAL,
    "zakup" DECIMAL,
    "gotovina" DECIMAL,
    "brojDjece" INTEGER,
    "napomena" TEXT,
    "izvorFajl" TEXT,
    "uploadovaoId" TEXT NOT NULL,
    "verifikovano" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ZastitnaKlauzula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tip" TEXT NOT NULL,
    "statusAktivna" BOOLEAN NOT NULL DEFAULT false,
    "aktiviranaAt" DATETIME,
    "deaktiviranaAt" DATETIME,
    "obrazlozenje" TEXT,
    "odlukaUOBroj" TEXT,
    "aktiviraoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Odluka" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "broj" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "opis" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "donioId" TEXT NOT NULL,
    "fajlUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Odluka_donioId_fkey" FOREIGN KEY ("donioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "akcija" TEXT NOT NULL,
    "entitet" TEXT NOT NULL,
    "entitetId" TEXT,
    "starVrijednost" TEXT,
    "novaVrijednost" TEXT,
    "ipAdresa" TEXT,
    "userAgent" TEXT,
    "uspjeh" BOOLEAN NOT NULL DEFAULT true,
    "greskaOpis" TEXT,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Zaposlenik_userId_key" ON "Zaposlenik"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ucinak_zaposlenikId_godina_key" ON "Ucinak"("zaposlenikId", "godina");

-- CreateIndex
CREATE UNIQUE INDEX "ParametriPlata_verzija_key" ON "ParametriPlata"("verzija");

-- CreateIndex
CREATE UNIQUE INDEX "ObracunStavka_obracunId_zaposlenikId_key" ON "ObracunStavka"("obracunId", "zaposlenikId");

-- CreateIndex
CREATE UNIQUE INDEX "Odluka_broj_key" ON "Odluka"("broj");
