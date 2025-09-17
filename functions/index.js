// functions/index.js - VERSÃO CORRIGIDA

// MUDANÇA 1: Importamos 'v1' para sermos mais explícitos.
const v1 = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Gatilho que executa toda vez que um novo usuário é criado no Firebase Authentication.
 */
// MUDANÇA 2: Usamos v1.auth em vez de functions.auth
exports.onUserCreate = v1.auth.user().onCreate(async (user) => {
  // MUDANÇA 3: Usamos v1.logger em vez de functions.logger
  v1.logger.info("Novo usuário criado:", user.uid, user.email);

  const businessDocRef = admin.firestore().collection("businesses").doc(user.uid);

  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio",
    slug: `negocio-${user.uid.substring(0, 6)}`,
    planId: "free",
    subscriptionStatus: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await businessDocRef.set(businessData);

  v1.logger.info("Documento do negócio criado para o usuário:", user.uid);
  return null;
});