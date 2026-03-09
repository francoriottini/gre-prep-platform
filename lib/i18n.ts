import type { Language } from "@/lib/types";

export const DEFAULT_LANGUAGE: Language = "es";

type Dictionary = Record<string, string>;

const es: Dictionary = {
  appTitle: "GRE Quant Gratis",
  appSubtitle: "Práctica accesible para LatAm",
  topic: "Tema",
  subtopic: "Subtema",
  difficulty: "Dificultad",
  numberOfQuestions: "Cantidad de preguntas",
  timeLimit: "Tiempo total (minutos)",
  generateQuiz: "Generar cuestionario",
  startQuiz: "Comenzar",
  submitQuiz: "Enviar respuestas",
  accuracy: "Precisión",
  avgTime: "Tiempo promedio",
  dashboard: "Progreso",
  login: "Iniciar sesión",
  logout: "Salir",
  guestMode: "Modo invitado",
  authenticatedMode: "Con cuenta",
  feedback: "Reportar feedback",
  reviewAnswers: "Revisar respuestas",
  noData: "Sin datos todavía",
  localProgressNotice: "Guardando progreso local (invitado).",
  remoteProgressNotice: "Guardando progreso en tu cuenta.",
  language: "Idioma",
  nextQuestion: "Siguiente",
  previousQuestion: "Anterior",
  finishQuiz: "Finalizar cuestionario",
  explanation: "Explicación",
  correct: "Correcta",
  incorrect: "Incorrecta",
  choice: "Opción",
  timeRemaining: "Tiempo restante",
  email: "Email",
  sendMagicLink: "Enviar enlace mágico",
  sentMagicLink: "Revisá tu correo para iniciar sesión."
};

const en: Dictionary = {
  appTitle: "Free GRE Quant",
  appSubtitle: "Accessible practice for LatAm",
  topic: "Topic",
  subtopic: "Subtopic",
  difficulty: "Difficulty",
  numberOfQuestions: "Number of questions",
  timeLimit: "Time limit (minutes)",
  generateQuiz: "Generate quiz",
  startQuiz: "Start",
  submitQuiz: "Submit answers",
  accuracy: "Accuracy",
  avgTime: "Average time",
  dashboard: "Progress",
  login: "Log in",
  logout: "Log out",
  guestMode: "Guest mode",
  authenticatedMode: "Account mode",
  feedback: "Send feedback",
  reviewAnswers: "Review answers",
  noData: "No data yet",
  localProgressNotice: "Saving progress locally (guest).",
  remoteProgressNotice: "Saving progress to your account.",
  language: "Language",
  nextQuestion: "Next",
  previousQuestion: "Previous",
  finishQuiz: "Finish quiz",
  explanation: "Explanation",
  correct: "Correct",
  incorrect: "Incorrect",
  choice: "Choice",
  timeRemaining: "Time remaining",
  email: "Email",
  sendMagicLink: "Send magic link",
  sentMagicLink: "Check your email to log in."
};

const dictionaries: Record<Language, Dictionary> = { es, en };

export function t(language: Language, key: keyof typeof es): string {
  return dictionaries[language][key] ?? dictionaries[DEFAULT_LANGUAGE][key] ?? key;
}

export function normalizeLanguage(value: string | null | undefined): Language {
  if (value === "en") {
    return "en";
  }
  return "es";
}
