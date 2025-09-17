// functions/index.js - VERSÃO FINAL COM SINTAXE MODERNA (V2)

const { onUserCreated } = require("firebase-functions/v2/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

/**
 * Gatilho que executa toda vez que um novo usuário é criado no Firebase Authentication.
 * Escrito com a sintaxe V2, mais moderna e robusta.
 */
exports.onUserCreate = onUserCreated(async (event) => {
  const user = event.data; // Na v2, os dados do usuário vêm de event.data
  logger.info("Novo usuário criado:", user.uid, user.email);

  const db = getFirestore();
  const businessDocRef = db.collection("businesses").doc(user.uid);

  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio",
    slug: `negocio-${user.uid.substring(0, 6)}`,
    planId: "free",
    subscriptionStatus: "active",
    createdAt: new Date(),
  };

  try {
    await businessDocRef.set(businessData);
    logger.info("Documento do negócio criado para o usuário:", user.uid);
  } catch (error) {
    logger.error("Erro ao criar documento do negócio:", error);
  }
});