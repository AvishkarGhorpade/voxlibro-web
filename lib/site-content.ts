import type { FeatureItem, FaqItem } from "@/types";

/**
 * Real VoxLibro product content.
 * VoxLibro is a free, independently-developed Android text-to-speech app
 * by Avishkar Ghorpade. There is no company, no subscription tiers, no
 * team, and no verified usage statistics — so none of those are present
 * here. Do not add invented stats, testimonials, or pricing.
 */

export const features: FeatureItem[] = [
  {
    id: "tts",
    title: "Text-to-Speech",
    description: "Convert notes, articles, documents, and study material into natural spoken audio.",
    icon: "Mic2",
  },
  {
    id: "offline",
    title: "Offline Speech Support",
    description: "Generate and listen to speech without an internet connection.",
    icon: "WifiOff",
  },
  {
    id: "voice-selection",
    title: "Voice Selection",
    description: "Choose from the voices installed on your device to find the one that suits you.",
    icon: "Users",
  },
  {
    id: "voice-preview",
    title: "Voice Preview",
    description: "Preview a voice before committing to it, so you always know what you're getting.",
    icon: "Ear",
  },
  {
    id: "speed",
    title: "Adjustable Speech Speed",
    description: "Slow down or speed up speech to match how you read and listen best.",
    icon: "Gauge",
  },
  {
    id: "clipboard",
    title: "Clipboard Detection",
    description: "VoxLibro can detect copied text and offer to read it aloud right away.",
    icon: "Clipboard",
  },
  {
    id: "stats",
    title: "Reading Statistics",
    description: "Track how much you've listened to over time.",
    icon: "BarChart3",
  },
  {
    id: "streak",
    title: "Reading Streak",
    description: "Build a daily habit and keep track of your reading streak.",
    icon: "Flame",
  },
  {
    id: "share",
    title: "Share Speech",
    description: "Share generated speeches with others directly from the app.",
    icon: "Share2",
  },
  {
    id: "delete-multiple",
    title: "Delete Multiple Speeches",
    description: "Manage your speech history in bulk with multi-select deletion.",
    icon: "Trash2",
  },
  {
    id: "char-counter",
    title: "Character Counter",
    description: "Keep track of text length as you type or paste content in.",
    icon: "Hash",
  },
  {
    id: "haptics",
    title: "Haptic Feedback",
    description: "Subtle haptic feedback makes interactions feel responsive and tactile.",
    icon: "Vibrate",
  },
];

export const faqs: FaqItem[] = [
  {
    id: "f1",
    category: "General",
    question: "What is VoxLibro?",
    answer:
      "VoxLibro is a free Android app that converts written text — notes, articles, documents, and study material — into speech, so you can listen instead of reading manually.",
  },
  {
    id: "f2",
    category: "General",
    question: "Which platforms is VoxLibro available on?",
    answer: "VoxLibro is currently available for Android.",
  },
  {
    id: "f3",
    category: "General",
    question: "Is VoxLibro free?",
    answer:
      "Yes. VoxLibro is a free, independently developed app with no subscription or paywall.",
  },
  {
    id: "f4",
    category: "Listening",
    question: "Does VoxLibro work offline?",
    answer: "Yes — VoxLibro supports offline speech generation, so you don't need an internet connection to use it.",
  },
  {
    id: "f5",
    category: "Listening",
    question: "Can I choose which voice reads my text?",
    answer:
      "Yes. VoxLibro lets you select from the voices available on your device and preview each one before using it.",
  },
  {
    id: "f6",
    category: "Listening",
    question: "Can I adjust the speech speed?",
    answer: "Yes, playback speed is adjustable to match your preferred pace.",
  },
  {
    id: "f7",
    category: "General",
    question: "Who makes VoxLibro?",
    answer:
      "VoxLibro is independently designed and developed by Avishkar Ghorpade. It's his first Android application published on Google Play — there is no company behind it.",
  },
];
