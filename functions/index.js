// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preapproval } = require("mercadopago");

admin.initializeApp();

// Função para criar o documento do negócio ao registrar usuário
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Novo usuário criado:", user.uid, user.email);

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

  await businessDocRef.set(businessData);

  functions.logger.info(
    "Documento do negócio criado para o usuário:",
    user.uid
  );

  return null;
});

// Função HTTPS Callable para criar a assinatura
exports.createSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Usuário não autenticado."
    );
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;
  const planId = data.planId; // ex: "basic" ou "pro"

  const plans = {
    basic: { price: 29.9, reason: "Assinatura Plano Básico - AgendaPro" },
    pro: { price: 49.9, reason: "Assinatura Plano Pro - AgendaPro" },
  };

  if (!plans[planId]) {
    throw new functions.https.HttpsError("invalid-argument", "Plano inválido.");
  }

  try {
    // Pega o access_token configurado no Firebase (via: firebase functions:config:set mercadopago.access_token="SUA_CHAVE")
    const accessToken = functions.config().mercadopago.access_token;

    const client = new MercadoPagoConfig({ accessToken });
    const preapprovalClient = new Preapproval(client);

    const response = await preapprovalClient.create({
      body: {
        reason: plans[planId].reason,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plans[planId].price,
          currency_id: "BRL",
        },
        payer_email: userEmail,
        back_url: "http://localhost:5173/dashboard/plans", // ajuste no deploy
        external_reference: userId,
      },
    });

    return { init_point: response.init_point };
  } catch (error) {
    console.error("Erro ao criar assinatura no Mercado Pago:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Não foi possível criar a assinatura."
    );
  }
});
