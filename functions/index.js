// functions/index.js

const { onUserCreated } = require("firebase-functions/v2/auth");
const { onCall } = require("firebase-functions/v2/https"); // Importar onCall
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { getDay, startOfDay, endOfDay, addMinutes, setHours, setMinutes } = require("date-fns"); // Importar funções do date-fns

initializeApp();
const db = getFirestore(); // Iniciar o Firestore aqui

// Função existente para criar documento do negócio
exports.onUserCreate = onUserCreated(async (event) => {
  const user = event.data;
  logger.info("Novo usuário criado:", user.uid, user.email);

  const businessDocRef = db.collection("businesses").doc(user.uid);

  const businessData = {
    ownerUid: user.uid,
    email: user.email,
    businessName: "Meu Negócio",
    slug: `negocio-${user.uid.substring(0, 6)}`,
    planId: "free",
    subscriptionStatus: "active",
    createdAt: FieldValue.serverTimestamp(),
  };

  await businessDocRef.set(businessData);
  logger.info("Documento do negócio criado para o usuário:", user.uid);
});


// NOVA FUNÇÃO para calcular horários disponíveis
exports.calculateAvailableSlots = onCall(async (request) => {
  // 1. Validar os dados recebidos do frontend
  const { businessId, serviceId, selectedDate } = request.data;
  if (!businessId || !serviceId || !selectedDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A função precisa de businessId, serviceId e selectedDate."
    );
  }

  try {
    // Mapeamento dos dias da semana
    const dayMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const date = new Date(selectedDate);
    const dayOfWeek = dayMap[getDay(date)];

    // 2. Buscar dados do negócio e do serviço
    const businessDoc = await db.collection("businesses").doc(businessId).get();
    if (!businessDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Negócio não encontrado.");
    }
    const businessData = businessDoc.data();

    const serviceDoc = await db.collection("businesses").doc(businessId).collection("services").doc(serviceId).get();
    if (!serviceDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Serviço não encontrado.");
    }
    const serviceData = serviceDoc.data();


    // 3. Verificar se o negócio está aberto no dia selecionado
    const dayInfo = businessData.workingHours[dayOfWeek];
    if (!dayInfo || !dayInfo.isOpen) {
      return { availableSlots: [] }; // Retorna lista vazia se estiver fechado
    }

    // 4. Buscar agendamentos existentes para o dia
    const startOfSelectedDay = startOfDay(date);
    const endOfSelectedDay = endOfDay(date);

    const appointmentsSnapshot = await db.collection("businesses").doc(businessId).collection("appointments")
      .where("startTime", ">=", Timestamp.fromDate(startOfSelectedDay))
      .where("startTime", "<=", Timestamp.fromDate(endOfSelectedDay))
      .get();

    const bookedTimes = appointmentsSnapshot.docs.map(doc => doc.data().startTime.toDate().getTime());

    // 5. Calcular todos os possíveis horários (slots)
    const slots = [];
    const serviceDuration = serviceData.duration;
    const [startHour, startMinute] = dayInfo.start.split(":").map(Number);
    const [endHour, endMinute] = dayInfo.end.split(":").map(Number);

    let currentTime = setMinutes(setHours(startOfSelectedDay, startHour), startMinute);
    let endTime = setMinutes(setHours(startOfSelectedDay, endHour), endMinute);


    while (addMinutes(currentTime, serviceDuration) <= endTime) {
      // 6. Verificar se o slot NÃO está na lista de agendados
      if (!bookedTimes.includes(currentTime.getTime())) {
        slots.push(currentTime.toISOString()); // Adiciona o slot livre à lista
      }
      currentTime = addMinutes(currentTime, serviceDuration);
    }

    // 7. Retornar os horários disponíveis
    return { availableSlots: slots };

  } catch (error) {
    logger.error("Erro ao calcular horários:", error);
    throw new functions.https.HttpsError("internal", "Não foi possível calcular os horários.");
  }
});