# Data Model — 001 Fundação e Painel

Modelo completo do sistema, criado inteiro nesta feature. Entidades marcadas
*(dormente)* existem no banco sem interface nem regra até a feature indicada.

## Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- identidade e tenant ----------

enum Vertical { BARBERSHOP NAILS AESTHETICS OTHER }
enum ProStatus { ONBOARDING ACTIVE SUSPENDED }

model Organization {              // dormente — feature de salão
  id            String         @id @default(cuid())
  name          String
  createdAt     DateTime       @default(now())
  professionals Professional[]
}

model Professional {
  id             String    @id @default(cuid())
  organizationId String?
  vertical       Vertical  @default(BARBERSHOP)
  slug           String    @unique
  name           String
  phone          String    @unique
  email          String    @unique
  timezone       String    @default("America/Sao_Paulo")

  defaultValidityDays Int   @default(30)
  cancelWindowHours   Int   @default(4)

  platformFeeBps    Int     @default(0)   // dormente — monetização
  providerAccountId String?               // dormente — feature 002

  status    ProStatus @default(ONBOARDING)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  organization  Organization?  @relation(fields: [organizationId], references: [id])
  services      Service[]
  packages      Package[]
  availability  Availability[]
  timeBlocks    TimeBlock[]
  purchases     Purchase[]
  ledger        SessionLedger[]
  appointments  Appointment[]

  @@index([organizationId])
}

// ---------- catálogo ----------

model Service {
  id             String  @id @default(cuid())
  professionalId String
  name           String
  durationMin    Int
  priceCents     Int
  active         Boolean @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  professional Professional  @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  packageItems PackageItem[]
  appointments Appointment[]
  ledger       SessionLedger[]

  @@index([professionalId, active])
}

enum PackageKind { ONE_TIME SUBSCRIPTION }
enum BillingInterval { MONTHLY }

model Package {
  id              String           @id @default(cuid())
  professionalId  String
  name            String
  kind            PackageKind
  priceCents      Int
  billingInterval BillingInterval?
  validityDays    Int
  active          Boolean          @default(false)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  professional Professional  @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  items        PackageItem[]
  purchases    Purchase[]

  @@index([professionalId, active])
}

model PackageItem {
  id        String @id @default(cuid())
  packageId String
  serviceId String
  quantity  Int

  package Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Restrict)

  @@unique([packageId, serviceId])
}

// ---------- agenda ----------

model Availability {
  id             String @id @default(cuid())
  professionalId String
  weekday        Int                 // 0 = domingo
  startTime      String              // "09:00" — hora local do profissional
  endTime        String              // "18:00"

  professional Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)

  @@index([professionalId, weekday])
}

model TimeBlock {
  id             String   @id @default(cuid())
  professionalId String
  startsAt       DateTime              // timestamptz, UTC
  endsAt         DateTime
  reason         String?
  createdAt      DateTime @default(now())

  professional Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)

  @@index([professionalId, startsAt])
}

// ---------- cliente e venda (dormentes nesta feature) ----------

model Customer {                 // dormente — feature 003
  id            String    @id @default(cuid())
  phone         String    @unique
  name          String?
  lastInboundAt DateTime?
  firstSeenAt   DateTime  @default(now())

  purchases    Purchase[]
  ledger       SessionLedger[]
  appointments Appointment[]
  conversation WaConversation?
}

enum PurchaseStatus { PENDING ACTIVE PAST_DUE CANCELLED EXPIRED }

model Purchase {                 // dormente — feature 002
  id                     String         @id @default(cuid())
  customerId             String
  professionalId         String
  packageId              String
  provider               String
  providerCustomerId     String?
  providerSubscriptionId String?
  status                 PurchaseStatus @default(PENDING)
  cycleStart             DateTime?
  cycleEnd               DateTime?
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt

  customer     Customer        @relation(fields: [customerId], references: [id])
  professional Professional    @relation(fields: [professionalId], references: [id])
  package      Package         @relation(fields: [packageId], references: [id])
  ledger       SessionLedger[]
  appointments Appointment[]

  @@index([professionalId, status])
  @@index([customerId, status])
}

enum LedgerReason {
  CREDIT_PURCHASE
  CREDIT_RENEWAL
  DEBIT_BOOKING
  CREDIT_CANCEL
  DEBIT_EXPIRY
  CREDIT_BONUS
  ADJUSTMENT
}

model SessionLedger {            // dormente — feature 002. Append-only por princípio I
  id             String       @id @default(cuid())
  purchaseId     String
  customerId     String
  professionalId String
  serviceId      String?
  delta          Int
  reason         LedgerReason
  appointmentId  String?
  idempotencyKey String       @unique
  expiresAt      DateTime?
  createdAt      DateTime     @default(now())

  purchase     Purchase     @relation(fields: [purchaseId], references: [id])
  customer     Customer     @relation(fields: [customerId], references: [id])
  professional Professional @relation(fields: [professionalId], references: [id])
  service      Service?     @relation(fields: [serviceId], references: [id])

  @@index([customerId, purchaseId])
  @@index([professionalId, createdAt])
}

enum ApptStatus { SCHEDULED DONE NO_SHOW CANCELLED_CUSTOMER CANCELLED_PRO }

model Appointment {              // dormente — feature 003
  id             String     @id @default(cuid())
  professionalId String
  customerId     String
  serviceId      String
  purchaseId     String?
  startsAt       DateTime              // timestamptz, UTC
  endsAt         DateTime
  status         ApptStatus @default(SCHEDULED)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  professional Professional @relation(fields: [professionalId], references: [id])
  customer     Customer     @relation(fields: [customerId], references: [id])
  service      Service      @relation(fields: [serviceId], references: [id])
  purchase     Purchase?    @relation(fields: [purchaseId], references: [id])

  @@index([professionalId, startsAt])
  @@index([customerId, startsAt])
}

// ---------- WhatsApp e agendamento de mensagens (dormentes) ----------

model WaConversation {           // dormente — feature 003
  customerId    String   @id
  state         Json
  lastMessageAt DateTime @default(now())

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}

enum MsgStatus { PENDING SENT FAILED SKIPPED }

model ScheduledMessage {         // dormente — feature 004
  id             String    @id @default(cuid())
  customerId     String
  appointmentId  String?
  templateName   String
  sendAt         DateTime
  status         MsgStatus @default(PENDING)
  payload        Json
  idempotencyKey String    @unique
  lockedAt       DateTime?
  attempts       Int       @default(0)
  createdAt      DateTime  @default(now())

  @@index([status, sendAt])
}

model WebhookEvent {             // dormente — feature 002. Princípio II
  id          String    @id @default(cuid())
  provider    String
  externalId  String
  payload     Json
  processedAt DateTime?
  receivedAt  DateTime  @default(now())

  @@unique([provider, externalId])
  @@index([provider, processedAt])
}
```

## Restrições que o Prisma não expressa

A migration inicial MUST incluir este SQL cru. Sem ele o princípio III não é
cumprido — e adicionar depois, com dados em produção, exige janela de manutenção.

```sql
-- necessária para EXCLUDE com igualdade em texto + range
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- dois agendamentos ativos nunca se sobrepõem para o mesmo profissional
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_no_overlap
  EXCLUDE USING gist (
    "professionalId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE (status IN ('SCHEDULED', 'DONE'));

-- o ledger é append-only: bloquear UPDATE e DELETE no próprio banco
CREATE OR REPLACE FUNCTION session_ledger_append_only()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'SessionLedger é append-only: use entrada de compensação';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_ledger_no_mutation
  BEFORE UPDATE OR DELETE ON "SessionLedger"
  FOR EACH ROW EXECUTE FUNCTION session_ledger_append_only();
```

O `WHERE (status IN ('SCHEDULED','DONE'))` é essencial: sem ele, um horário cancelado
continuaria bloqueando a vaga.

O trigger de append-only transforma o princípio I de convenção em garantia. Custa três
linhas e elimina a classe inteira de bug de "alguém deu UPDATE no saldo".

## Saldo de sessões

Saldo nunca é coluna. É esta consulta:

```sql
SELECT COALESCE(SUM(delta), 0) AS saldo
FROM "SessionLedger"
WHERE "customerId" = $1
  AND "purchaseId" = $2
  AND ("expiresAt" IS NULL OR "expiresAt" > now());
```

Nenhuma escrita no ledger ocorre nesta feature.

## Notas de integridade

- `PackageItem.service` usa `onDelete: Restrict`: serviço que compõe pacote não pode ser excluído, apenas desativado (FR-011).
- `Package.active` nasce `false`: pacote só é publicado após ter composição válida (FR-022).
- `Professional.phone` e `email` são unique: um profissional por telefone e por e-mail.
- `Availability` não tem constraint de sobreposição no banco — é validação de aplicação, porque comparar `HH:MM` textual por dia da semana em constraint exigiria coluna gerada. Risco aceito: o profissional é o único escritor da própria disponibilidade, sem concorrência real.
