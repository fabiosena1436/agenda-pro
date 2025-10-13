const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { addMinutes, getDay, startOfDay, endOfDay } = require("date-fns");
const cors = require("cors")({ origin: true });
const { Storage } = require("@google-cloud/storage");

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info("Novo utilizador criado:", user.uid, user.email);
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

exports.calculateAvailableSlots = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
    const { data } = req.body;
    const { businessId, serviceId, selectedDate } = data;
    if (!businessId || !serviceId || !selectedDate) {
      return res.status(400).json({ error: { message: "Faltam parâmetros essenciais." } });
    }
    try {
      const businessDoc = await db.collection('businesses').doc(businessId).get();
      const serviceDoc = await db.collection('businesses').doc(businessId).collection('services').doc(serviceId).get();
      if (!businessDoc.exists || !serviceDoc.exists) {
        return res.status(404).json({ error: { message: "Negócio ou serviço não encontrado." } });
      }
      const businessData = businessDoc.data();
      const serviceData = serviceDoc.data();
      if (!businessData.workingHours) {
          functions.logger.warn(`O negócio ${businessId} não tem horários configurados.`);
          return res.status(200).json({ data: { availableSlots: [] } });
      }
      const workingHours = businessData.workingHours;
      const serviceDuration = serviceData.duration;
      const date = new Date(selectedDate);
      const dayOfWeek = getDay(date);
      const weekDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const dayKey = weekDays[dayOfWeek];
      const dayConfig = workingHours[dayKey];
      if (!dayConfig || !dayConfig.isOpen) {
        return res.status(200).json({ data: { availableSlots: [] } });
      }
      const startOfDayDate = startOfDay(date);
      const endOfDayDate = endOfDay(date);
      const appointmentsSnapshot = await db.collection('businesses').doc(businessId).collection('appointments')
        .where('startTime', '>=', startOfDayDate)
        .where('startTime', '<=', endOfDayDate)
        .get();
      const existingAppointments = appointmentsSnapshot.docs.map(doc => ({
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate()
      }));
      const availableSlots = [];
      const [startHour, startMinute] = dayConfig.start.split(':').map(Number);
      const [endHour, endMinute] = dayConfig.end.split(':').map(Number);
      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);
      while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, serviceDuration);
        if (slotEnd > endTime) break;
        const isOverlapping = existingAppointments.some(app => (currentTime < app.end && slotEnd > app.start));
        if (!isOverlapping && currentTime > new Date()) {
          availableSlots.push(currentTime.toISOString());
        }
        currentTime = addMinutes(currentTime, 15);
      }
      return res.status(200).json({ data: { availableSlots } });
    } catch (error) {
      functions.logger.error("Erro ao calcular horários:", error);
      return res.status(500).json({ error: { message: "Ocorreu um erro interno ao buscar os horários." } });
    }
  });
});

exports.createSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      const email = decodedToken.email;
      const { data } = req.body;
      const { planId } = data;
      const client = new MercadoPagoConfig({ 
        accessToken: functions.config().mercadopago.access_token 
      });
      const plans = {
          basic: { reason: 'AgendaPro - Plano Básico', price: 29.90 },
          pro: { reason: 'AgendaPro - Plano Pro', price: 49.90 },
      };
      const plan = plans[planId];
      if (!plan) {
        return res.status(404).json({ error: { message: "Plano não encontrado." } });
      }
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [{
              title: plan.reason,
              unit_price: plan.price,
              quantity: 1,
          }],
          payer: { email: email },
          back_urls: {
              success: 'http://localhost:5173/dashboard',
              failure: 'http://localhost:5173/dashboard/plans',
              pending: 'http://localhost:5173/dashboard/plans',
          },
          auto_return: 'approved',
          external_reference: `${uid}_${planId}_${Date.now()}`,
        }
      });
      return res.status(200).json({ data: { init_point: result.init_point } });
    } catch (error) {
      functions.logger.error('Erro ao criar preferência do Mercado Pago:', error);
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).send('Unauthorized');
      }
      return res.status(500).json({ error: { message: "Erro ao processar pagamento." } });
    }
  });
});

exports.generateUploadUrl = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: { message: 'Unauthorized' }});
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      const { data } = req.body;
      const { filePath, contentType } = data;
      if (!filePath || !contentType) {
        return res.status(400).json({ error: { message: 'filePath e contentType são obrigatórios.' }});
      }
      if (!filePath.startsWith(`businesses/${uid}/`)) {
          return res.status(403).json({ error: { message: 'Permission-denied.' }});
      }
      const bucket = storage.bucket("agendapro-web.firebasestorage.app");
      const file = bucket.file(filePath);
      const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutos
        contentType,
      };
      const [url] = await file.getSignedUrl(options);
      return res.status(200).json({ data: { signedUrl: url } });
    } catch (error) {
      functions.logger.error("Erro ao gerar URL assinada:", error);
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).json({ error: { message: 'Unauthorized' }});
      }
      return res.status(500).json({ error: { message: "Erro interno ao gerar URL de upload." } });
    }
  });
});