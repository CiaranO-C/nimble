import { Prisma } from "@prisma/client";
import { CSVFile } from "../file/type";
import { parseDateTime } from "../file/utils";

async function validateFile(
  hash: string,
  userId: string,
  tx: Prisma.TransactionClient,
) {
  const hashExists = await tx.file.findUnique({
    where: {
      hash_ownerId: {
        hash,
        ownerId: userId,
      },
    },
  });

  if (hashExists) return false;
  return true;
}

async function deleteTempUserFiles(
  userId: string,
  tx: Prisma.TransactionClient,
) {
  const { temporary } = await tx.user.findUnique({ where: { id: userId } });
  if (temporary) deleteUserFiles(userId, tx);
}

async function deleteUserFiles(userId: string, tx: Prisma.TransactionClient) {
  const deleted = await tx.file.deleteMany({
    where: { ownerId: userId },
  });
  return deleted;
}

async function createFileEntry(
  ownerId: string,
  hash: string,
  parsedFile: CSVFile,
  tx: Prisma.TransactionClient,
) {
  const startDate = parseDateTime(parsedFile[0]["Date of sale"]);
  const endDate = parseDateTime(
    parsedFile[parsedFile.length - 1]["Date of sale"],
  );
  const entry = await tx.file.create({
    data: {
      hash,
      startDate,
      endDate,
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
  });
  return entry;
}

async function createLocations(
  locations: Prisma.LocationCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.location.createMany({
    data: locations,
    skipDuplicates: true,
  });
}

async function createBuyers(
  buyers: Prisma.BuyerCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.buyer.createMany({
    data: buyers,
    skipDuplicates: true,
  });
}

async function createUserBuyers(
  relations: Prisma.UserBuyerCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.userBuyer.createMany({
    data: relations,
    skipDuplicates: true,
  });
}

async function createBuyerLocations(
  relations: Prisma.BuyerLocationCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.buyerLocation.createMany({
    data: relations,
    skipDuplicates: true,
  });
}

async function createSales(
  sales: Prisma.SaleCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.sale.createMany({
    data: sales,
    skipDuplicates: true,
  });
}

async function createItems(
  items: Prisma.ItemCreateManyInput[],
  tx: Prisma.TransactionClient,
) {
  await tx.item.createMany({
    data: items,
    skipDuplicates: true,
  });
}

export {
  validateFile,
  createBuyerLocations,
  createBuyers,
  createFileEntry,
  deleteUserFiles,
  deleteTempUserFiles,
  createItems,
  createLocations,
  createSales,
  createUserBuyers,
};
