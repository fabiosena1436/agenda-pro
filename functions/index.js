const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { getDay, startOfDay, endOfDay, addMinutes } = require("date-fns");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");

// CORREÇÃO: Adicionando a importação do CORS que estava faltando
const cors = require("cors")({ origin: true });

// Inicialização correta dos serviços do Firebase
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage(); // CORREÇÃO: Usando a inicialização correta do admin SDK

// Função auxiliar para fuso horário
const createZonedDate = (date, hours, minutes) => {
  const timeZone = 'America/Sao_Paulo';
  const zonedDate = utcToZonedTime(date, timeZone);
  zonedDate.setHours(hours, minutes, 0, 0);
  return zonedTimeToUtc(zonedDate, timeZone);
};

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

exports.calculateAvailableSlots = functions.https.onCall(async (data, context) => {
  const { businessId, serviceId, selectedDate } = data;
  if (!businessId || !serviceId || !selectedDate) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltam parâmetros essenciais.');
  }

  try {
    const timeZone = 'America/Sao_Paulo';
    const businessDoc = await db.collection('businesses').doc(businessId).get();
    const serviceDoc = await db.collection('businesses').doc(businessId).collection('services').doc(serviceId).get();
    
    if (!businessDoc.exists || !serviceDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Negócio ou serviço não encontrado.');
    }

    const businessData = businessDoc.data();
    const serviceData = serviceDoc.data();
    
    // CORREÇÃO: Validando se a duração do serviço existe
    if (!serviceData.duration || typeof serviceData.duration !== 'number') {
        functions.logger.error(`Serviço ${serviceId} sem duração definida.`);
        throw new functions.https.HttpsError('failed-precondition', 'O serviço selecionado não tem uma duração válida.');
    }
    
    if (!businessData.workingHours) {
        return { availableSlots: [] };
    }

    const workingHours = businessData.workingHours;
    const serviceDuration = serviceData.duration;
    
    const clientDate = new Date(selectedDate);
    const dayOfWeek = getDay(utcToZonedTime(clientDate, timeZone));
    
    const weekDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayKey = weekDays[dayOfWeek];
    const dayConfig = workingHours[dayKey];

    // Adicionando lógica de migração para estruturas de dados antigas
    if (dayConfig && !dayConfig.intervals) {
      if (dayConfig.start && dayConfig.end) {
        dayConfig.intervals = [{ start: dayConfig.start, end: dayConfig.end }];
      } else {
        dayConfig.intervals = [];
      }
    }

    if (!dayConfig || !dayConfig.isOpen || !dayConfig.intervals || dayConfig.intervals.length === 0) {
      return { availableSlots: [] };
    }

    const startOfDayInZone = zonedTimeToUtc(startOfDay(utcToZonedTime(clientDate, timeZone)), timeZone);
    const endOfDayInZone = zonedTimeToUtc(endOfDay(utcToZonedTime(clientDate, timeZone)), timeZone);

    const appointmentsSnapshot = await db.collection('businesses').doc(businessId).collection('appointments')
      .where('startTime', '>=', startOfDayInZone)
      .where('startTime', '<=', endOfDayInZone)
      .get();
    const existingAppointments = appointmentsSnapshot.docs.map(doc => ({
      start: doc.data().startTime.toDate(),
      end: doc.data().endTime.toDate()
    }));
    
    const blockagesSnapshot = await db.collection('businesses').doc(businessId).collection('blockages')
      .where('startTime', '>=', startOfDayInZone)
      .where('startTime', '<=', endOfDayInZone)
      .get();
    const existingBlockages = blockagesSnapshot.docs.map(doc => ({
      start: doc.data().startTime.toDate(),
      end: doc.data().endTime.toDate()
    }));
    
    const unavailableTimes = [...existingAppointments, ...existingBlockages];
    const availableSlots = [];

    dayConfig.intervals.forEach(interval => {
      // CORREÇÃO: Validando se o intervalo está bem formatado
      if (interval && typeof interval.start === 'string' && typeof interval.end === 'string') {
        
        const startParts = interval.start.split(':');
        const endParts = interval.end.split(':');

        // ADICIONADO: Validação robusta para o formato do horário "HH:mm"
        if (startParts.length !== 2 || endParts.length !== 2) {
          functions.logger.warn(`Intervalo de horário mal formatado ignorado: ${JSON.stringify(interval)} para o negócio ${businessId}`);
          return; // Pula para o próximo intervalo
        }

        const [startHour, startMinute] = startParts.map(Number);
        const [endHour, endMinute] = endParts.map(Number);

        // ADICIONADO: Validação se as partes são números válidos
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          functions.logger.warn(`Intervalo de horário com partes não numéricas ignorado: ${JSON.stringify(interval)} para o negócio ${businessId}`);
          return; // Pula para o próximo intervalo
        }

        let currentTime = createZonedDate(clientDate, startHour, startMinute);
        const endTime = createZonedDate(clientDate, endHour, endMinute);

        while (currentTime < endTime) {
          const slotEnd = addMinutes(currentTime, serviceDuration);
          if (slotEnd > endTime) break;

          const isOverlapping = unavailableTimes.some(app => (currentTime < app.end && slotEnd > app.start));
          
          if (!isOverlapping && currentTime > new Date()) {
            availableSlots.push(currentTime.toISOString());
          }
          currentTime = addMinutes(currentTime, serviceDuration);
        }
      }
    });

    availableSlots.sort((a, b) => new Date(a) - new Date(b));

    return { availableSlots };

  } catch (error) {
    functions.logger.error("Erro ao calcular horários:", error);
    throw new functions.https.HttpsError('internal', 'Ocorreu um erro interno ao buscar os horários.');
  }
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

      // CORREÇÃO: Usar a origem da requisição para as URLs de retorno
      const origin = req.headers.origin || 'https://agendapro-web.firebaseapp.com'; // Fallback para a URL de produção

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
              success: `${origin}/dashboard`,
              failure: `${origin}/dashboard/plans`,
              pending: `${origin}/dashboard/plans`,
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