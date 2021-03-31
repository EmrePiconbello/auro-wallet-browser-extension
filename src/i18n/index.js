import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocal, saveLocal } from "../background/localStorage";
import { DEFAULT_LANGUAGE } from "../../config";
import { LANGUAGE_CONFIG } from "../constant/storageKey";
import en from "./en.json";
import zh from "./zh_CN.json";

const resources = {
  en: {
    translation: {
      ...en,
    },
  },
  zh_CN: {
    translation: {
      ...zh,
    },
  },
};

export function changeLanguage(lan) {
  i18n.changeLanguage(lan);
  saveLocal(LANGUAGE_CONFIG, lan)
}

export function getCurrentLang() {
  return i18n.language
}
export const languageOption = [
  { key: 'en', value: 'English' },
  { key: 'zh_CN', value: '中文' },
]
export var default_language = DEFAULT_LANGUAGE

export function languageInit() {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: default_language,
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
    });

  let res = getLocal(LANGUAGE_CONFIG)
  if (res) {
    changeLanguage(res)
    default_language = res
  } else {
    const language = navigator.language || navigator.userLanguage;
    res = language == 'zh_CN' ? 'zh_CN' : 'en';
    changeLanguage(res)
    default_language = res
    saveLocal(LANGUAGE_CONFIG, res)
  }

  return res
}



export function getLanguage(key) {
  return i18n.t(key)
}


languageInit()
