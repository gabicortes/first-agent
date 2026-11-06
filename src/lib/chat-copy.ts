export const chatCopy = {
  en: {
    home: "FitCoach AI home",
    subtitle: "ONLINE · YOUR FITNESS COACH",
    title: "ASK ME ANYTHING FITNESS",
    topics: "Workouts · Nutrition · Recovery · Programming · Supplements",
    conversation: "Conversation with your coach",
    you: "YOU",
    thinking: "Your coach is thinking…",
    suggestionsLabel: "Suggested questions",
    suggestionsTitle: "SUGGESTED QUESTIONS",
    inputLabel: "Ask your fitness coach",
    placeholder: "Ask about workouts, nutrition, recovery...",
    send: "Send message",
    hint: "SHIFT+ENTER FOR NEW LINE · ENTER TO SEND",
    error: "Couldn't reach your coach. Please try sending your message again.",
    language: "Language",
    signIn: "Sign in",
    signUp: "Create account",
    suggestions: [
      "What's the best split for building muscle 4 days/week?",
      "How much protein do I actually need?",
      "How do I break through a deadlift plateau?",
      "What's a good beginner HIIT routine?",
      "Should I train fasted or fed for fat loss?",
      "How long should I rest between sets for hypertrophy?",
    ],
  },
  es: {
    home: "Inicio de FitCoach AI",
    subtitle: "EN LÍNEA · TU ENTRENADOR PERSONAL",
    title: "PREGÚNTAME SOBRE ENTRENAMIENTO",
    topics:
      "Ejercicio · Nutrición · Recuperación · Planificación · Suplementos",
    conversation: "Conversación con tu entrenador",
    you: "TÚ",
    thinking: "Tu entrenador está pensando…",
    suggestionsLabel: "Preguntas sugeridas",
    suggestionsTitle: "PREGUNTAS SUGERIDAS",
    inputLabel: "Pregúntale a tu entrenador",
    placeholder: "Pregunta sobre ejercicio, nutrición, recuperación...",
    send: "Enviar mensaje",
    hint: "SHIFT+ENTER PARA UN SALTO DE LÍNEA · ENTER PARA ENVIAR",
    error:
      "No se pudo contactar a tu entrenador. Intenta enviar tu mensaje de nuevo.",
    language: "Idioma",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    suggestions: [
      "¿Cómo distribuyo mi entrenamiento para ganar músculo 4 días por semana?",
      "¿Cuánta proteína necesito realmente?",
      "¿Cómo supero un estancamiento en peso muerto?",
      "¿Cuál es una buena rutina de HIIT para principiantes?",
      "¿Debo entrenar en ayunas o después de comer para perder grasa?",
      "¿Cuánto debo descansar entre series para ganar masa muscular?",
    ],
  },
};


export type ChatLanguage = keyof typeof chatCopy;
export type ChatCopy = (typeof chatCopy)[ChatLanguage];
