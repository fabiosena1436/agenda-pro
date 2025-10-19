const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const { getDay, startOfDay, endOfDay, addMinutes, startOfMonth, endOfMonth } = require("date-fns"); 
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

// NOVIDADE: Função auxiliar para verificar se o utilizador é Super Admin
const isSuperAdmin = async (uid) => {
    if (!uid) return false;
    // Verifica a existência do UID na coleção 'superAdmins'
    const adminDoc = await db.collection('superAdmins').doc(uid).get();
    return adminDoc.exists;
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

// NOVIDADE: Função Callable para Ações de Super Admin
exports.adminManageBusiness = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'Apenas utilizadores autenticados podem realizar esta ação.');
    }
    
    // 1. VERIFICAÇÃO DE PERMISSÃO DE SUPER ADMIN
    const callerIsAdmin = await isSuperAdmin(context.auth.uid);
    if (!callerIsAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas Super Administradores podem realizar esta ação.');
    }

    const { targetBusinessId, action, value } = data;

    if (!targetBusinessId || !action) {
        throw new functions.https.HttpsError('invalid-argument', 'Faltam o ID do negócio alvo e a ação a ser executada.');
    }

    const businessDocRef = db.collection('businesses').doc(targetBusinessId);
    
    try {
        switch (action) {
            case 'changePlan':
                if (!['free', 'basic', 'pro', 'plus'].includes(value)) { // 'plus' é assumido como um plano futuro
                    throw new new functions.https.HttpsError('invalid-argument', 'Plano inválido.');
                }
                await businessDocRef.update({
                    planId: value,
                    // Poderia adicionar uma lógica de expiração da subscrição aqui se necessário
                });
                return { success: true, message: `Plano atualizado para ${value}.` };

            case 'blockBusiness':
                await businessDocRef.update({
                    isBlocked: true,
                    blockReason: value || 'Bloqueado pelo administrador.',
                });
                return { success: true, message: `Negócio bloqueado com sucesso. Razão: ${value}` };

            case 'unblockBusiness':
                await businessDocRef.update({
                    isBlocked: false,
                    blockReason: admin.firestore.FieldValue.delete(), // Remove o campo
                });
                return { success: true, message: 'Negócio desbloqueado com sucesso.' };

            case 'deleteBusiness':
                // Nota: Apagar o utilizador do Auth deve ser feito separadamente ou em cascata
                await businessDocRef.delete();
                return { success: true, message: 'Documento do negócio apagado (Ação manual necessária para Auth e Storage).' };
                
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Ação desconhecida.');
        }
    } catch (error) {
        functions.logger.error(`Erro ao gerir negócio ${targetBusinessId} com ação ${action}:`, error);
        throw new functions.https.HttpsError('internal', 'Erro na gestão do negócio.');
    }
});

exports.createAppointment = functions.https.onCall(async (data, context) => {
    const { businessId, serviceId, serviceName, clientName, clientPhone, startTime, duration } = data;

    // 1. Validação
    if (!businessId || !serviceId || !clientName || !clientPhone || !startTime || !duration || !serviceName) {
        throw new functions.https.HttpsError('invalid-argument', 'Faltam dados essenciais para o agendamento.');
    }
    
    try {
        const businessDocRef = db.collection('businesses').doc(businessId);
        const businessDoc = await businessDocRef.get();

        if (!businessDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Negócio não encontrado.');
        }

        const businessData = businessDoc.data();
        const planId = businessData.planId || 'free';
        const appointmentStartTime = new Date(startTime);
        
        // 2. VERIFICAÇÃO DO LIMITE DE AGENDAMENTOS (Plano Grátis)
        if (planId === 'free') {
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);
            const endOfCurrentMonth = endOfMonth(now);

            // Consulta para contar agendamentos do mês atual
            const appointmentsQuery = db.collection('businesses').doc(businessId).collection('appointments')
                .where('startTime', '>=', admin.firestore.Timestamp.fromDate(startOfCurrentMonth))
                .where('startTime', '<=', admin.firestore.Timestamp.fromDate(endOfCurrentMonth));

            const appointmentsSnapshot = await appointmentsQuery.get();
            const currentAppointmentsCount = appointmentsSnapshot.size;

            // Limite de 10 agendamentos para o plano grátis
            if (currentAppointmentsCount >= 10) {
                functions.logger.info(`Limite de agendamentos atingido para o negócio ${businessId}.`);
                throw new functions.https.HttpsError('permission-denied', 'O seu Plano Grátis atingiu o limite de 10 agendamentos por mês.');
            }
        }
        
        // 3. Criação do Agendamento
        const appointmentRef = db.collection('businesses').doc(businessId).collection('appointments');
        const appointmentData = {
            serviceId,
            serviceName,
            clientName,
            clientPhone,
            startTime: admin.firestore.Timestamp.fromDate(appointmentStartTime),
            endTime: admin.firestore.Timestamp.fromDate(addMinutes(appointmentStartTime, duration)),
            status: 'confirmed',
            duration: duration,
        };

        const docRef = await appointmentRef.add(appointmentData);

        return { success: true, appointmentId: docRef.id };

    } catch (error) {
        if (error.code === 'permission-denied' || error.code === 'not-found' || error.code === 'invalid-argument') {
            throw error;
        }
        functions.logger.error("Erro interno ao criar agendamento:", error);
        throw new functions.https.HttpsError('internal', 'Ocorreu um erro interno ao processar o agendamento.');
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

    const uniqueSlots = [...new Set(availableSlots)];
    uniqueSlots.sort((a, b) => new Date(a) - new Date(b));

    return { availableSlots: uniqueSlots };

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