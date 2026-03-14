import type { Language } from "@/lib/types";

export const DEFAULT_LANGUAGE: Language = "es";

type Dictionary = Record<string, string>;

const es: Dictionary = {
  appTitle: "GRE Quant Gratis",
  appSubtitle: "Practica accesible para LatAm",
  topic: "Tema",
  subtopic: "Subtema",
  difficulty: "Dificultad",
  numberOfQuestions: "Cantidad de preguntas",
  timeLimit: "Tiempo total (minutos)",
  generateQuiz: "Generar cuestionario",
  startQuiz: "Comenzar",
  submitQuiz: "Enviar respuestas",
  accuracy: "Precision",
  avgTime: "Tiempo promedio",
  dashboard: "Progreso",
  login: "Iniciar sesion",
  logout: "Salir",
  guestMode: "Modo invitado",
  authenticatedMode: "Con cuenta",
  feedback: "Reportar feedback",
  feedbackOther: "Otro",
  feedbackError: "Error",
  feedbackAmbiguous: "Ambigua",
  feedbackTooEasy: "Muy facil",
  feedbackTooHard: "Muy dificil",
  feedbackRequiresLogin: "Inicia sesion para enviar feedback sobre una pregunta.",
  feedbackSent: "Enviado",
  sendFeedbackCta: "Enviar feedback",
  commentLabel: "Comentario",
  difficultyVoteLabel: "Voto de dificultad (1-5)",
  reviewAnswers: "Revisar respuestas",
  noData: "Sin datos todavia",
  localProgressNotice: "Guardando progreso local (invitado).",
  remoteProgressNotice: "Guardando progreso en tu cuenta.",
  language: "Idioma",
  nextQuestion: "Siguiente",
  previousQuestion: "Anterior",
  finishQuiz: "Finalizar cuestionario",
  explanation: "Explicacion",
  correct: "Correcta",
  incorrect: "Incorrecta",
  choice: "Opcion",
  timeRemaining: "Tiempo restante",
  email: "Email",
  sendMagicLink: "Enviar enlace magico",
  sentMagicLink: "Revisa tu correo para iniciar sesion."
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
  feedbackOther: "Other",
  feedbackError: "Error",
  feedbackAmbiguous: "Ambiguous",
  feedbackTooEasy: "Too easy",
  feedbackTooHard: "Too hard",
  feedbackRequiresLogin: "Log in to send question feedback.",
  feedbackSent: "Sent",
  sendFeedbackCta: "Send feedback",
  commentLabel: "Comment",
  difficultyVoteLabel: "Difficulty vote (1-5)",
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
