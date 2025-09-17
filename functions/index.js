// Cole este código no arquivo functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Gatilho que executa toda vez que um novo usuário é criado no Firebase Authentication.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Novo usuário criado:", user.uid, user.email);

  // O caminho para o novo documento na coleção 'businesses'
  const businessDocRef = admin.firestore().collection("businesses").doc(user.uid);

  // Os dados que queremos salvar para o novo negócio
  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio", // Um nome padrão
    slug: `negocio-${user.uid.substring(0, 6)}`, // Um slug único padrão
    planId: "free", // O plano inicial!
    subscriptionStatus: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Salva os dados no Firestore
  await businessDocRef.set(businessData);

  functions.logger.info("Documento do negócio criado para o usuário:", user.uid);
  return null;
});