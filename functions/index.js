// functions/index.js

// 1. Importações da nova forma (v2)
const {onUserCreated} = require("firebase-functions/v2/auth");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

// 2. Inicialização do Admin SDK (continua igual)
initializeApp();

// 3. Exportação da função com a nova sintaxe onUserCreated()
exports.onUserCreate = onUserCreated(async (event) => {
  const user = event.data; // O objeto do usuário agora vem de event.data

  logger.info("Novo usuário criado:", user.uid, user.email);

  // O caminho para o novo documento (agora usando getFirestore())
  const businessDocRef = getFirestore().collection("businesses").doc(user.uid);

  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio",
    slug: `negocio-${user.uid.substring(0, 6)}`,
    planId: "free",
    subscriptionStatus: "active",
    createdAt: FieldValue.serverTimestamp(), // Usando o FieldValue importado
  };

  await businessDocRef.set(businessData);

  logger.info("Documento do negócio criado para o usuário:", user.uid);
});