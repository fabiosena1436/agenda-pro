const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Novo utilizador criado:", user.uid, user.email);

  const db = admin.firestore();
  const businessDocRef = db.collection("businesses").doc(user.uid);

  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio",
    slug: `negocio-${user.uid.substring(0, 6)}`,
    planId: "free",
    subscriptionStatus: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await businessDocRef.set(businessData);
    functions.logger.info("Documento do negócio criado para o utilizador:", user.uid);
  } catch (error) {
    functions.logger.error("Erro ao criar documento do negócio:", error);
  }
});