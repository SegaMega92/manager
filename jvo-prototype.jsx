import React, { useState, useEffect, useRef } from 'react'
import {
  ComposedChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  BarChart3, Bell, Settings, ChevronDown, ChevronUp, X, Check,
  SkipForward, CheckCircle2, AlertCircle, Clock, Zap, List,
  ChevronRight, ArrowRight, Edit3, Info, Play, Plus, Download,
  ShoppingBag, Tag, Package, Eye, MessageSquare, Star, Megaphone,
  TrendingUp, AlertTriangle, Sparkles,
  MessageCircle, LayoutGrid, Activity, TableProperties, Settings2,
  History, Calculator, Globe, Truck, Box
} from 'lucide-react'

// ─── GLOBAL STYLES (breathing dot + fade-in-up) ───────────────────────────────
const GLOBAL_STYLES = `
  @keyframes breathe {
    0%, 100% { opacity: 0.45; }
    50%       { opacity: 1;    }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .breathe-dot  { animation: breathe 2.5s ease-in-out infinite; }
  .fade-in-up   { animation: fadeInUp 0.4s ease-out forwards;   }
`

// ─── ACCENT ──────────────────────────────────────────────────────────────────
// color: purple, matching Figma
const A = {
  bg: 'bg-purple-600',
  bgHover: 'hover:bg-purple-700',
  text: 'text-purple-600',
  border: 'border-purple-600',
  light: 'bg-purple-50',
  lightText: 'text-purple-700',
  ring: 'focus:ring-purple-500',
}

// ─── ANALYSIS SCENE DATA ─────────────────────────────────────────────────────

const REASONING_LINES = [
  'Загружаю матрицу — 4 артикула на Wildberries',
  'Анализирую экономику за 05.04–05.05: продажи 88 527 ₽ / 66 шт.',
  'Обнаружен критический факт: маржинальность 0,7% при ДРР 18,9%',
  'Диагностирую по артикулам: 1 рабочий, 2 убыточных, 1 без остатка',
  'Формирую план восстановления маржи на 60 дней: цель 18,5%',
]

const INSIGHT_CARDS = [
  { icon: 'TrendingUp',    text: 'Артикул 14433381 — единственный с положительной маржой (+10,5%). Основа плана.' },
  { icon: 'AlertCircle',   text: 'Артикулы 14433382 и 28920236 убыточны: маржа -9,7% и -15,1%' },
  { icon: 'AlertTriangle', text: 'Реклама съедает 18,9% от продаж. Оптимизация даёт +6 п.п. к марже' },
]

const SCENARIO_CANDIDATES = [
  { id: 1, name: 'Агрессивное наращивание рекламного бюджета',   desc: 'Резкий рост ставок и охвата по всем 4 артикулам',         rejected: true,  reason: 'Реклама уже 18,9% от продаж — рост обнулит маржу' },
  { id: 2, name: 'Участие во всех акциях площадки без фильтрации', desc: 'Подключить все акции WB для ускорения продаж',          rejected: true,  reason: 'При маржинальности 0,7% скидки приведут к убытку' },
  { id: 3, name: 'Защита минимальной маржи через управление ценой', desc: 'Повышение цены на 2–3% там, где есть спрос, без потери заказов', rejected: false },
  { id: 4, name: 'Контроль участия в акциях',                    desc: 'Входить в акции только при сохранении положительной маржи', rejected: false },
  { id: 5, name: 'Оптимизация рекламы под прибыль',              desc: 'Отключить неэффективные расходы, оставить только работающие связки', rejected: false },
]

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const CHAT_SCRIPT = [
  { id: 0, speaker: 'user', content: 'Хочу поднять продажи на Wildberries за следующие 3 месяца по всей матрице товаров' },
  {
    id: 1, speaker: 'agent',
    content: 'Автоматизация плана продаж — это не просто прогноз, а рабочая система, которая на основе ваших вводных формирует реалистичные целевые показатели, распределяет их по сценариям и продуктам, а затем контролирует соблюдение маржинальности и рекламных бюджетов. Это позволяет сократить время на ручное планирование, минимизировать ошибки и оперативно корректировать стратегию. Начнём?',
  },
  { id: 2, speaker: 'user', content: 'Давай' },
  {
    id: 3, speaker: 'agent',
    intro: 'Отлично! Мы последовательно пройдём 5 шагов: выберем метрику плана, срок, маркетплейс, ассортимент и бизнес-ограничения. Весь процесс займёт 5–7 минут.',
    heading: 'Шаг 1. Метрика плана',
    content: 'По какой метрике будем формировать план? Доступные варианты:',
    bullets: ['Заказы (количество)', 'Продажи (выручка)', 'Маржинальность (прибыль)'],
  },
  { id: 4, speaker: 'user', content: 'давайте по продажам' },
  {
    id: 5, speaker: 'agent',
    content: 'Принято. План будет строиться на основе выручки. Переходим к следующему шагу.',
    heading: 'Шаг 2. Срок плана',
    content2: 'Выберите горизонт планирования:',
    bullets: ['3 месяца (рекомендуется для быстрого запуска)', '6 месяцев (оптимально для структурированного планирования)', 'Произвольный срок (укажите даты)'],
  },
  { id: 6, speaker: 'user', content: '3 месяца' },
  {
    id: 7, speaker: 'agent',
    content: 'Зафиксировал: период планирования — 3 месяца. Это позволит алгоритму учесть сезонность и динамику.',
    heading: 'Шаг 3. Маркетплейс',
    content2: 'Для каких маркетплейсов будем планировать?',
    bullets: ['Wildberries', 'OZON'],
  },
  { id: 8, speaker: 'user', content: 'WB' },
  {
    id: 9, speaker: 'agent',
    content: 'Понял. План будет формироваться с учётом специфики площадки: комиссий, логистики и рекламных инструментов.',
    heading: 'Шаг 4. Товары',
    content2: 'Выберите уровень детализации ассортимента:',
    bullets: ['Конкретные артикулы', 'Группы товаров', 'Категории', 'Вся матрица'],
    note: '⚠️ Важно: один артикул не может участвовать в двух активных планах одновременно. Я автоматически проверю конфликты при создании.',
  },
  { id: 10, speaker: 'user', content: 'Вся матрица' },
  {
    id: 11, speaker: 'agent',
    content: 'Записал. Проверил выбранные артикулы на наличие в других активных планах — конфликтов не обнаружено. Все позиции доступны.',
    heading: 'Шаг 5. Ограничения бизнеса',
    content2: 'Задаём параметры, которые система будет соблюдать при расчёте плана:',
    bullets: ['Минимальная цена товара (₽)', 'ДРР — максимально допустимая доля рекламных расходов (%)'],
  },
  { id: 12, speaker: 'user', content: 'Настройте ДРР' },
  {
    id: 13, speaker: 'agent',
    content: 'Зафиксировали ограничения.',
    content2: 'Как вы хотите работать с готовым планом?',
    bullets: ['Автоматический режим: публикую и принимаю план без дополнительного согласования', 'Ручной режим: проверяю расчёты и формирую изменения к одобрению'],
    note: '⚠️ Важно: в ручном режиме от вас потребуется оперативно реагировать на большое количество событий. Несвоевременное реагирование может негативно повлиять на результаты стратегии.',
  },
  { id: 14, speaker: 'user', content: 'пока выберем ручной режим — хотим контролировать каждый этап' },
  {
    id: 15, speaker: 'agent',
    content: 'Понял, устанавливаю ручной режим подтверждения. Это разумное решение на старте: вы сможете оценить логику моих расчётов и при необходимости заморозить план.',
    content2: 'О ходе работы я буду присылать сводку в виде письма. Кого хотите уведомлять о результатах?',
  },
  { id: 16, speaker: 'user', content: 'только меня' },
  {
    id: 17, speaker: 'agent',
    content: 'Отлично, каждое утро я буду присылать вам короткую сводку с полей.',
    isSummary: true,
  },
]

const SCENARIOS_PROPOSAL = [
  {
    id: 1,
    name: 'Защита минимальной маржи через управление ценой',
    agent: 'Агент Ценообразования',
    desc: 'Удерживает прибыльность товаров и не позволяет продавать ниже экономически оправданного уровня. Фокус на 14433381, 14433382 и 28920236.',
    algorithm: 'Если маржинальность ниже 8% — повышать цену на 2–3% не чаще раза в 2 дня. Если остаток менее 60 дней продаж — +2% к цене. Не снижать цену при отрицательной марже. По 59100591 — не менять цену до пополнения остатка.',
    impact: 'маржа +13 000 ₽, маржинальность +5,0 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
  },
  {
    id: 2,
    name: 'Контроль участия в акциях',
    agent: 'Агент Акций',
    desc: 'Не допускает участия товаров в акциях, где итоговая цена ниже минимально допустимой. Акции — только для ускорения продаж товаров с большим остатком.',
    algorithm: 'Входить в акцию только если после скидки сохраняется положительная маржа. По 14433382 — только при маржинальности не ниже 10%. По 28920236 — только короткие акции. По 59100591 — не участвовать до появления остатка.',
    impact: 'маржа +6 000 ₽, маржинальность +2,2 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
  },
  {
    id: 3,
    name: 'Оптимизация рекламы под прибыль, а не под оборот',
    agent: 'Агент Рекламы',
    desc: 'Сокращает неэффективные расходы и оставляет рекламу только там, где она приводит к заказам с положительной экономикой.',
    algorithm: 'Отключать направления без заказов за 2 дня. Снижать ставку на 10–15% при низком CTR. По 14433382 — резко ограничить бюджет до подтверждения положительной маржи. По 59100591 — рекламу не запускать до пополнения остатка.',
    impact: 'маржа +16 000 ₽, маржинальность +6,0 п.п., ДРР с 18,9% → 9–10%',
    coverage: '4 артикула',
    freq: '1 раз в день',
  },
  {
    id: 4,
    name: 'Рост доверия и допродажи через отзывы',
    agent: 'Агент Отзывов',
    desc: 'Повышает доверие к карточкам и снижает потери конверсии. Ответы вежливые, конкретные, с аргументацией преимуществ и мягкими рекомендациями.',
    algorithm: 'Отвечать на все новые отзывы ежедневно. В позитивных — сценарии повторной покупки. В нейтральных — объяснять особенности. В негативных — спокойно и аргументированно. Усиливать доверие к 14433381 как основному товару.',
    impact: 'маржа +3 000 ₽, маржинальность +1,1 п.п., конверсия +1–2 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
  },
  {
    id: 5,
    name: 'Повышение конверсии через ответы на вопросы',
    agent: 'Агент Вопросов',
    desc: 'Помогает покупателям быстрее принять решение, закрывает возражения и снижает зависимость от скидок.',
    algorithm: 'Отвечать на вопросы в день поступления. Объяснять применение простым языком. По товарам с низкой конверсией — конкретика: размер, состав, ограничения, совместимость. Фиксировать частые вопросы для улучшения карточек.',
    impact: 'маржа +2 500 ₽, маржинальность +0,9 п.п., конверсия из корзины +1–1,5 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
  },
]

const SCENARIOS_DASHBOARD = [
  {
    id: 1,
    name: 'Защита минимальной маржи через управление ценой',
    icon: <Tag size={16} />,
    agent: 'Агент Ценообразования',
    desc: 'Удерживает прибыльность товаров и не позволяет продавать ниже экономически оправданного уровня.',
    algorithm: 'Если маржинальность ниже 8% — повышать цену на 2–3% не чаще раза в 2 дня. Если остаток менее 60 дней продаж — +2% к цене. Не снижать цену при отрицательной марже. По 59100591 — не менять цену до пополнения остатка.',
    impact: 'маржа +13 000 ₽, маржинальность +5,0 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
    corrections: [
      {
        date: '12.05.25', time: '09:14',
        text: 'Артикул 14433381 устойчиво держит заказы 4 дня подряд после повышения цены на 2%. Спрос не просел — рекомендую увеличить шаг повышения до 3%, чтобы быстрее выйти на целевую маржинальность.',
        changes: [{ label: 'Шаг повышения цены', from: '2%', to: '3%' }],
      },
      {
        date: '14.05.25', time: '11:40',
        text: 'По артикулу 14433382 после повышения цены заказы упали на 35% за 2 дня. Экономика не улучшилась. Рекомендую откатить шаг до 1,5% и зафиксировать текущий уровень цены на 5 дней.',
        changes: [{ label: 'Шаг изменения цены', from: '3%', to: '1,5%' }],
      },
    ],
  },
  {
    id: 2,
    name: 'Контроль участия в акциях',
    icon: <Star size={16} />,
    agent: 'Агент Акций',
    desc: 'Не допускает участия товаров в акциях с ценой ниже минимально допустимой. Акции — только для ускорения оборота у товаров с большим остатком.',
    algorithm: 'Входить в акцию только если после скидки сохраняется положительная маржа. По 14433382 — только при маржинальности не ниже 10%. По 28920236 — только короткие акции. По 59100591 — не участвовать до появления остатка.',
    impact: 'маржа +6 000 ₽, маржинальность +2,2 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
    corrections: [
      {
        date: '13.05.25', time: '08:55',
        text: 'WB предложил акцию с глубиной скидки 22% для артикула 14433382. При текущей цене маржинальность уйдёт в минус (-3,1%). Агент заблокировал участие. Рекомендую снизить порог допустимой скидки для этого артикула.',
        changes: [{ label: 'Макс. скидка для 14433382', from: '25%', to: '15%' }],
      },
    ],
  },
  {
    id: 3,
    name: 'Оптимизация рекламы под прибыль',
    icon: <Megaphone size={16} />,
    agent: 'Агент Рекламы',
    desc: 'Сокращает неэффективные расходы и оставляет рекламу только там, где она приводит к заказам с положительной экономикой.',
    algorithm: 'Отключать направления без заказов за 2 дня. Снижать ставку на 10–15% при CTR ниже 2%. По 14433382 — резко ограничить бюджет до подтверждения положительной маржи. По 59100591 — рекламу не запускать до пополнения остатка.',
    impact: 'маржа +16 000 ₽, маржинальность +6,0 п.п., ДРР с 18,9% → 9–10%',
    coverage: '4 артикула',
    freq: '1 раз в день',
    corrections: [],
  },
  {
    id: 4,
    name: 'Рост доверия и допродажи через отзывы',
    icon: <MessageSquare size={16} />,
    agent: 'Агент Отзывов',
    desc: 'Повышает доверие к карточкам и снижает потери конверсии через своевременные и аргументированные ответы.',
    algorithm: 'Отвечать на все новые отзывы ежедневно. В позитивных — сценарии повторной покупки. В нейтральных — объяснять особенности. В негативных — спокойно и аргументированно. Усиливать доверие к 14433381 как основному товару.',
    impact: 'маржа +3 000 ₽, маржинальность +1,1 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
    corrections: [],
  },
  {
    id: 5,
    name: 'Повышение конверсии через ответы на вопросы',
    icon: <MessageCircle size={16} />,
    agent: 'Агент Вопросов',
    desc: 'Помогает покупателям быстрее принять решение, закрывает возражения и снижает зависимость от скидок.',
    algorithm: 'Отвечать на вопросы в день поступления. По товарам с низкой конверсией — конкретика: размер, состав, применение, ограничения. Фиксировать частые вопросы для улучшения карточек.',
    impact: 'маржа +2 500 ₽, маржинальность +0,9 п.п.',
    coverage: '4 артикула',
    freq: '1 раз в день',
    corrections: [],
  },
]

const EVENTS = [
  {
    id: 1, time: '22:32', date: '12.05.25',
    scenario: 'Ответы на свежие вопросы с акцентом на преимущества',
    desc: 'Алгоритм для автоматического ответа ИИ на вопросы за последние 7 дней по выбранным товарам, с акцентом на преимущества товара и вдохновляющим стилем...',
    pending: 24, errors: 3, success: 24,
    items: [
      {
        id: '14376882', name: 'Рубашка классическая приталенная...', brand: 'MIXERS SHIRT',
        pending: 24, success: 24,
        ops: [
          { time: '22:32', type: 'Обработка кластеров', name: 'Изменение ставки кластеров', status: 'Успешно', detail: 'Изменил ставку 58 Р → 68 Р для 25 кластеров' },
          { time: '22:32', type: 'Обработка кластеров', name: 'Исключение кластеров из кампании', status: 'Успешно', detail: 'Исключил из рекламной кампании 16 кластеров' },
          { time: '22:32', type: '', name: 'Анализ статистики товара', status: 'Успешно', detail: 'Средняя позиция 127 · Текущая ставка 58 Р · Кликов 756 · Показов 24 756 · CTR 2%' },
        ],
      },
    ],
  },
  {
    id: 2, time: '22:32', date: '12.05.25',
    scenario: 'Регулировка цен на товары в зависимости от оборачиваемости. FBO. WB',
    desc: 'Алгоритм для изменения скидок на товары в зависимости от их оборачиваемости, чтобы оптимизировать продажи и поддерживать оптимальный уровень запасов.',
    pending: 24, errors: 3, success: 24,
    items: [],
  },
  {
    id: 3, time: '22:32', date: '12.05.25',
    scenario: 'СРМ рекламная кампания WB: минимальная стоимость ставки',
    desc: 'Сценарий повышает СРМ для кластеров, которые показывают потенциал к росту видимости без чрезмерного увеличения затрат. Помогает аккуратно поднять вид...',
    pending: 24, errors: 3, success: 24,
    items: [],
  },
]

const CHART_DATA = [
  { t: 0, plan: 310, fact: 308, base: 305 },
  { t: 1, plan: 320, fact: 318, base: 310 },
  { t: 2, plan: 330, fact: 332, base: 315 },
  { t: 3, plan: 340, fact: 341, base: 318 },
  { t: 4, plan: 354.6, fact: 381.2, base: 330.7 },
  { t: 5, plan: 360, fact: null, base: null },
  { t: 6, plan: 368, fact: null, base: null },
  { t: 7, plan: 372, fact: null, base: null },
  { t: 8, plan: 375, fact: null, base: null },
  { t: 9, plan: 378, fact: null, base: null },
  { t: 10, plan: 380, fact: null, base: null },
  { t: 11, plan: 383, fact: null, base: null },
  { t: 12, plan: 386, fact: null, base: null },
  { t: 13, plan: 390, fact: null, base: null },
]

const REPORT_ROWS = [
  { period: 'Март', sales: '330,7 млн', salesD: null, orders: '411,9 млн', ordersD: null, ordersN: '99 482', margin: '33,3 млн', marginP: '9,1' },
  { period: 'Апрель', sales: '354,8 млн', salesD: '+33,9 млн', orders: '423,9 млн', ordersD: '+23,9 млн', ordersN: '105 048', ordersND: '+5 866', margin: '38,3 млн', marginD: '+5 млн', marginP: '9,8', marginPD: '+0,7' },
  { period: 'Май', sales: '381,2 млн', salesD: '+26,8 млн', orders: '451,9 млн', ordersD: '+26,8 млн', ordersN: '111 405', ordersND: '+8 357', margin: '41,8 млн', marginD: '+3,3 млн', marginP: '10,6', marginPD: '+0,8' },
  { period: 'Июнь', sales: '400 млн', salesD: '+18,8 млн', orders: '487 млн', ordersD: '+33,9 млн', ordersN: '117 747', ordersND: '+6 342', margin: '45,8 млн', marginD: '+4,2 млн', marginP: '11,3', marginPD: '+0,7' },
  { period: 'Сумма', sales: '1,328 млрд', salesD: '+187,8 млн', orders: '1,383 млрд', ordersD: '+187,4 млн', ordersN: '334 200', ordersND: '+45 381', margin: '127,6 млн', marginD: '+30,9 млн', marginP: '11,3', marginPD: '+1,2', isTotal: true },
]

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const SIDEBAR_BG     = '#F3EEFF'
const SIDEBAR_BORDER = '#E4D9FF'
const SIDEBAR_ACTIVE = '#EBE0FF'

const TOP_NAV = [
  { icon: <MessageCircle size={18} />,    label: 'Чат с Агентом' },
  { icon: <LayoutGrid size={18} />,       label: 'Мониторинг' },
  { icon: <Box size={18} />,              label: 'Все артикулы' },
  { icon: <Activity size={18} />,         label: 'События' },
  { icon: <TableProperties size={18} />,  label: 'Управление матрицей' },
]

const AUTO_SUB = [
  { icon: <BarChart3 size={15} />,  label: 'Планы продаж', key: 'plans' },
  { icon: <Zap size={15} />,        label: 'Сценарии', key: 'scenarios' },
  { icon: <History size={15} />,    label: 'История',  key: 'history' },
  { icon: <Calculator size={15} />, label: 'Финансы',  key: 'finance' },
]

function Sidebar({ highlightPlans, onNavigate }) {
  const [open, setOpen]         = useState(false)
  const [autoOpen, setAutoOpen] = useState(true)

  return (
    <div
      className="relative flex-shrink-0 h-full"
      style={{ width: 56 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* The actual panel — expands over content */}
      <div
        className="absolute left-0 top-0 h-full z-40 flex flex-col overflow-hidden transition-all duration-200 ease-out"
        style={{
          width: open ? 256 : 56,
          background: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
        }}
      >
        {/* Logo */}
        <div className="flex-shrink-0 h-14 flex items-center gap-3 px-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-700">
            <span className="font-black text-white text-sm leading-none">Ĵ</span>
          </div>
          <span
            className="font-black text-purple-950 text-base tracking-wide whitespace-nowrap transition-opacity duration-150"
            style={{ opacity: open ? 1 : 0 }}
          >
            ДЖИВИО
          </span>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">

          {/* Top items */}
          {TOP_NAV.map((item, i) => (
            <div
              key={i}
              title={!open ? item.label : undefined}
              className="flex items-center gap-3 mx-2 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-purple-200/50"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-800">
                {item.icon}
              </div>
              <span
                className="text-sm font-medium text-purple-950 whitespace-nowrap transition-opacity duration-150"
                style={{ opacity: open ? 1 : 0 }}
              >
                {item.label}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div className="mx-3 my-2" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }} />

          {/* Автоматизация */}
          <div className="mx-2">
            <button
              onClick={() => setAutoOpen(v => !v)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors hover:bg-purple-200/50"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-800">
                <Settings2 size={18} />
              </div>
              <span
                className="flex-1 text-left text-sm font-medium text-purple-950 whitespace-nowrap transition-opacity duration-150"
                style={{ opacity: open ? 1 : 0 }}
              >
                Автоматизация
              </span>
              {open && (
                <span className="flex-shrink-0 text-purple-400 mr-1">
                  {autoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              )}
            </button>

            {/* Expanded sub-section */}
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: open && autoOpen ? 260 : 0, opacity: open ? 1 : 0 }}
            >
              <div className="mt-1 rounded-xl px-2 py-2" style={{ background: SIDEBAR_ACTIVE }}>
                <p className="text-xs text-purple-500 leading-relaxed px-2 mb-2">
                  Создавайте свои алгоритмы и используйте готовые, чтобы упростить и ускорить работу
                </p>
                {AUTO_SUB.map(sub => (
                  <div
                    key={sub.key}
                    onClick={() => sub.key === 'plans' && onNavigate?.('plans')}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors
                      ${sub.key === 'plans' && highlightPlans
                        ? 'bg-white shadow-sm cursor-pointer'
                        : sub.key === 'plans'
                          ? 'hover:bg-purple-300/30 cursor-pointer'
                          : 'cursor-default opacity-50'}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0
                      ${sub.key === 'plans' && highlightPlans ? 'text-purple-700' : 'text-purple-600'}`}>
                      {sub.icon}
                    </div>
                    <span className={`text-sm whitespace-nowrap
                      ${sub.key === 'plans' && highlightPlans
                        ? 'font-semibold text-purple-900'
                        : 'font-medium text-purple-800'}`}>
                      {sub.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-3 my-2" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }} />

          {/* SEO PRO */}
          <div
            title={!open ? 'SEO' : undefined}
            className="flex items-center gap-3 mx-2 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-purple-200/50"
          >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-800">
              <Globe size={18} />
            </div>
            <span
              className="flex-1 text-sm font-medium text-purple-950 whitespace-nowrap transition-opacity duration-150"
              style={{ opacity: open ? 1 : 0 }}
            >
              SEO
            </span>
            {open && (
              <>
                <span className="flex-shrink-0 text-xs font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-md mr-1">PRO</span>
                <ChevronDown size={14} className="flex-shrink-0 text-purple-400" />
              </>
            )}
          </div>

          {/* Логистика PRO */}
          <div
            title={!open ? 'Логистика' : undefined}
            className="flex items-center gap-3 mx-2 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-purple-200/50"
          >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-800">
              <Truck size={18} />
            </div>
            <span
              className="flex-1 text-sm font-medium text-purple-950 whitespace-nowrap transition-opacity duration-150"
              style={{ opacity: open ? 1 : 0 }}
            >
              Логистика
            </span>
            {open && (
              <>
                <span className="flex-shrink-0 text-xs font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-md mr-1">PRO</span>
                <ChevronDown size={14} className="flex-shrink-0 text-purple-400" />
              </>
            )}
          </div>
        </div>

        {/* Bottom: avatar + bell */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-3 py-3 overflow-hidden"
          style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}
        >
          <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-800 flex-shrink-0 cursor-pointer">
            WO
          </div>
          <span
            className="flex-1 text-sm font-medium text-purple-900 whitespace-nowrap transition-opacity duration-150"
            style={{ opacity: open ? 1 : 0 }}
          >
            Мой профиль
          </span>
          {open && (
            <Bell size={16} className="flex-shrink-0 text-purple-400 cursor-pointer hover:text-purple-700 transition-colors" />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── START SCREEN ─────────────────────────────────────────────────────────────

function StartScreen({ onStart, onNavigate }) {
  const [task, setTask] = useState('')

  return (
    <div className="flex-1 flex">
      <Sidebar highlightPlans={false} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 justify-center mb-6 text-gray-500 text-sm">
            <Zap size={14} className="text-purple-600" />
            агент
          </div>
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-8 leading-tight">
            Что автоматизируем<br />сегодня?
          </h1>

          {/* Preset CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-4 flex items-center justify-between mb-3">
            <div>
              <p className="text-white text-sm font-medium">Агент создаст план</p>
              <p className="text-purple-200 text-xs mt-0.5">и автоматизирует рост продаж</p>
            </div>
            <button
              onClick={() => onStart('Хочу поднять продажи на Wildberries за следующие 3 месяца по всей матрице товаров')}
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              Создать план
            </button>
          </div>

          {/* Free input */}
          <div className="relative">
            <input
              type="text"
              value={task}
              onChange={e => setTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && task.trim() && onStart(task)}
              placeholder="Или опишите задачу своими словами"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              onClick={() => task.trim() && onStart(task)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <ArrowRight size={14} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────

function ChatScreen({ initialTask, preset, onPlanReady, onNavigate }) {
  // preset: 'start' | 'full' | 'drawer'
  const isFullOrDrawer = preset === 'full' || preset === 'drawer'
  const [visible, setVisible] = useState(() => isFullOrDrawer ? CHAT_SCRIPT.map(s => s.id) : [0])
  const [step, setStep] = useState(() => isFullOrDrawer ? CHAT_SCRIPT.length : 1)
  const [typing, setTyping] = useState(false)
  const [showPanel, setShowPanel] = useState(preset === 'drawer')
  // skipAnalysis=true → AnalysisPanel starts in final state (from demo jump)
  const skipAnalysis = preset === 'drawer'
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visible, typing])

  // Auto-show panel when dialogue ends
  useEffect(() => {
    if (step >= CHAT_SCRIPT.length && !showPanel && !skipAnalysis) {
      const t = setTimeout(() => setShowPanel(true), 700)
      return () => clearTimeout(t)
    }
  }, [step])

  // Auto-advance chat
  useEffect(() => {
    if (step >= CHAT_SCRIPT.length || showPanel) return
    const s = CHAT_SCRIPT[step]
    const delay = s.speaker === 'agent' ? 1300 : 700
    if (s.speaker === 'agent') {
      setTyping(true)
      const t = setTimeout(() => {
        setTyping(false)
        setVisible(v => [...v, s.id])
        setStep(x => x + 1)
      }, delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setVisible(v => [...v, s.id])
        setStep(x => x + 1)
      }, delay)
      return () => clearTimeout(t)
    }
  }, [step, showPanel])

  // No auto-show panel — user triggers via button

  const handleSkip = () => {
    setVisible(CHAT_SCRIPT.map(s => s.id))
    setStep(CHAT_SCRIPT.length)
    setTyping(false)
  }

  const visibleSteps = CHAT_SCRIPT.filter(s => visible.includes(s.id))

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans={false} onNavigate={onNavigate} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${showPanel ? '' : ''}`}>
        {/* Chat header */}
        <div className="flex-shrink-0 px-8 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Попросите Дживио Агента</span>
          {step < CHAT_SCRIPT.length && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <SkipForward size={12} />
              Пропустить диалог
            </button>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 py-6 space-y-5">
              {visibleSteps.map(s => (
                s.speaker === 'user'
                  ? <UserBubble key={s.id} content={s.content} />
                  : <AgentMessage key={s.id} step={s} initialTask={initialTask} />
              ))}
              {typing && <TypingDots />}
              <div ref={bottomRef} />
            </div>
          </div>

          {showPanel && (
            <AnalysisPanel skipToEnd={skipAnalysis} onLaunch={onPlanReady} />
          )}
        </div>
      </div>
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div className="flex justify-end">
      <div className="bg-gray-900 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function AgentMessage({ step, initialTask }) {
  if (step.isSummary) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-800 leading-relaxed">{step.content}</p>
        <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-1.5">
          <p className="text-sm font-semibold text-gray-900 mb-2">Итого</p>
          {[
            'Метрика: Продажи (выручка)',
            'Срок: 3 месяца',
            'Маркетплейс: Wildberries',
            'Охват: вся матрица на текущий момент',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
              {item}
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Конфигурация сохранена. Когда будете готовы, дайте команду «Всё отлично» — и подготовлю план и необходимые функции в течение 2–3 минут.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 text-sm text-gray-800 leading-relaxed">
      {step.id === 0 && initialTask && (
        <p className="text-gray-500 italic text-xs">Вы описали задачу: «{initialTask}»</p>
      )}
      {step.intro && <p>{step.intro}</p>}
      {step.content && <p>{step.content}</p>}
      {step.heading && (
        <p className="font-bold text-gray-900 mt-3">{step.heading}</p>
      )}
      {step.content2 && <p>{step.content2}</p>}
      {step.bullets && (
        <ul className="space-y-0.5 pl-1">
          {step.bullets.map((b, i) => <li key={i} className="text-gray-700">• {b}</li>)}
        </ul>
      )}
      {step.note && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 leading-relaxed">
          {step.note}
        </div>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

// ─── ANALYSIS PANEL (Фича 1) ──────────────────────────────────────────────────

const DRAWER_TABS = [
  { id: 'analysis',   label: 'Анализ' },
  { id: 'strategy',   label: 'Стратегия' },
  { id: 'goals',      label: 'Цели' },
  { id: 'scenarios',  label: 'Сценарии' },
]

// Текущая экономика за период данных (05.04–05.05)
const STRATEGY_ECONOMY = [
  { label: 'Продажи',              value: '88 527 ₽ / 66 шт.' },
  { label: 'Расходы на рекламу',   value: '16 734 ₽ (18,9% от продаж)' },
  { label: 'Себестоимость',        value: '31 644 ₽' },
  { label: 'Комиссия WB',          value: '31 918 ₽' },
  { label: 'Логистика',            value: '4 167 ₽' },
  { label: 'Платное хранение',     value: '3 431 ₽' },
  { label: 'Итоговая маржа',       value: '≈ 633 ₽' },
  { label: 'Маржинальность',       value: '≈ 0,7%', highlight: true },
]

const STRATEGY_ARTICLES = [
  { id: '14433381', sales: '49 190 ₽ / 38 шт.', stock: '78 шт. (~60 дней)', margin: '+5 168 ₽',  marginP: '+10,5%', verdict: 'Основной рабочий товар. База для роста маржи: аккуратно повышать цену, удерживать рекламу только по эффективным связкам.' },
  { id: '14433382', sales: '29 210 ₽ / 11 шт.', stock: '410 шт.',           margin: '−2 836 ₽',  marginP: '−9,7%',  verdict: 'Высокий остаток, слабая экономика. Нельзя масштабировать без ограничения рекламы и пересмотра акций.' },
  { id: '28920236', sales: '9 642 ₽ / 16 шт.',  stock: '40 шт.',            margin: '−1 455 ₽',  marginP: '−15,1%', verdict: 'Продаётся, но экономика отрицательная. Нужно повышение цены или отключение нерентабельной рекламы.' },
  { id: '59100591', sales: '485 ₽ / 1 шт.',     stock: '0 шт.',             margin: '−243 ₽',    marginP: 'убыток', verdict: 'Выбыл из планирования — нет остатка. Не продвигать до пополнения склада.' },
]

const PLAN_PHASES = [
  { days: 'Дни 1–7',   desc: 'Быстрый эффект: отключение нерентабельной рекламы, ограничение акций ниже минимальной цены' },
  { days: 'Дни 8–14',  desc: 'Мягкое повышение цен по товарам с устойчивым спросом' },
  { days: 'Дни 15–21', desc: 'Перераспределение рекламного бюджета только в товары и запросы с положительной маржей' },
  { days: 'Дни 22–45', desc: 'Закрепление маржинальности на уровне 14–17%' },
  { days: 'Дни 46–60', desc: 'Выход на дневную маржинальность 18–18,5%' },
]

const GOALS_KPIS = [
  { label: 'Итоговая маржа за план', value: '42 330 ₽',  sub: '06.05–04.07, 60 дней' },
  { label: 'Целевая маржинальность', value: '18,5%',      sub: 'к концу периода' },
  { label: 'Начальная точка',        value: '0,7%',       sub: 'маржинальность сейчас' },
  { label: 'Прирост маржинальности', value: '+15–18 п.п.', sub: 'за 60 дней' },
]

// Недельный план маржинальности (factMargin/factMarginP — только для завершённых недель)
const WEEKLY_PLAN = [
  { week: 'Нед 1', dates: '06–10.05',    margin: 1490,  marginP: 8.8,  factMargin: 1540,  factMarginP: 9.1  },
  { week: 'Нед 2', dates: '11–17.05',    margin: 3210,  marginP: 10.2, factMargin: 3360,  factMarginP: 10.5 },
  { week: 'Нед 3', dates: '18–24.05',    margin: 4020,  marginP: 11.6, factMargin: 3920,  factMarginP: 11.3 },
  { week: 'Нед 4', dates: '25–31.05',    margin: 4720,  marginP: 12.8, factMargin: 5280,  factMarginP: 13.1 },
  { week: 'Нед 5', dates: '01–07.06',    margin: 5230,  marginP: 14.0, factMargin: null,  factMarginP: null },
  { week: 'Нед 6', dates: '08–14.06',    margin: 5650,  marginP: 15.1, factMargin: null,  factMarginP: null },
  { week: 'Нед 7', dates: '15–21.06',    margin: 5990,  marginP: 16.0, factMargin: null,  factMarginP: null },
  { week: 'Нед 8', dates: '22–28.06',    margin: 6290,  marginP: 16.8, factMargin: null,  factMarginP: null },
  { week: 'Нед 9', dates: '29.06–04.07', margin: 5730,  marginP: 17.8, factMargin: null,  factMarginP: null },
]

// ─── PLANS LIST DATA ─────────────────────────────────────────────────────────

const PLANS_LIST = [
  {
    id: 1,
    name: 'Вся матрица Wildberries — 60 дней',
    fullName: 'Вся матрица Wildberries — 60 дней (06.05–04.07)',
    status: 'active',
    goal: 42330,
    current: 14100,
    remaining: 28230,
    pct: 33,
    delta: +0.3,
    daysLeft: 31,
    marginNow: 13.1,
    marginPlan: 12.8,
    marginGoal: 18.5,
    updatedAt: '25.05',
    desc: 'Стартовая точка — маржинальность 0,7% при ДРР 18,9%. Цель: довести маржу до 18,5% за 60 дней через управление ценой, фильтрацию акций и оптимизацию рекламы.',
    sparkline: [8.8, 9.1, 11.3, 13.1],
    canOpen: true,
  },
  {
    id: 2,
    name: 'Летняя коллекция OZON — 45 дней',
    fullName: 'Летняя коллекция OZON — 45 дней (10.04–24.05)',
    status: 'done',
    goal: 31000,
    current: 31800,
    remaining: 0,
    pct: 103,
    delta: +2.1,
    daysLeft: 0,
    marginNow: 19.4,
    marginPlan: 18.0,
    marginGoal: 18.0,
    updatedAt: '24.05',
    desc: 'План перевыполнен: маржинальность 19,4% при цели 18%. Ключевой драйвер — оптимизация рекламных ставок и участие в двух акциях с положительной маржой.',
    sparkline: [9.2, 11.4, 14.0, 15.8, 17.2, 19.4],
    canOpen: false,
  },
  {
    id: 3,
    name: 'Новинки категории "Дом" WB — 30 дней',
    fullName: 'Новинки категории "Дом" WB — 30 дней (01.05–31.05)',
    status: 'active',
    goal: 18000,
    current: 6100,
    remaining: 11900,
    pct: 34,
    delta: -1.2,
    daysLeft: 12,
    marginNow: 9.8,
    marginPlan: 11.0,
    marginGoal: 14.0,
    updatedAt: '24.05',
    desc: 'Новые артикулы ещё в фазе набора отзывов. Маржинальность ниже плана на 1,2 п.п. — агент скорректировал рекламные ставки, ожидается улучшение на нед. 4.',
    sparkline: [5.1, 7.3, 8.9, 9.8],
    canOpen: false,
  },
]

// График план vs факт маржинальность + действия агента по неделям
// actReviews — ответы на отзывы, actClusters — изм. кластеров, actPrice — изм. цены
const MARGIN_CHART_DATA = [
  { week: 'Нед 1', план: 8.8,  факт: 9.1,  actReviews: 4, actClusters: 2, actPrice: 3 },
  { week: 'Нед 2', план: 10.2, факт: 10.5, actReviews: 6, actClusters: 1, actPrice: 4 },
  { week: 'Нед 3', план: 11.6, факт: 11.3, actReviews: 5, actClusters: 3, actPrice: 2 },
  { week: 'Нед 4', план: 12.8, факт: 13.1, actReviews: 7, actClusters: 2, actPrice: 5 },
  { week: 'Нед 5', план: 14.0, факт: null, actReviews: null, actClusters: null, actPrice: null },
  { week: 'Нед 6', план: 15.1, факт: null, actReviews: null, actClusters: null, actPrice: null },
  { week: 'Нед 7', план: 16.0, факт: null, actReviews: null, actClusters: null, actPrice: null },
  { week: 'Нед 8', план: 16.8, факт: null, actReviews: null, actClusters: null, actPrice: null },
  { week: 'Нед 9', план: 17.8, факт: null, actReviews: null, actClusters: null, actPrice: null },
]

function AnalysisPanel({ skipToEnd, onLaunch }) {
  const [step, setStep]           = useState(skipToEnd ? 99 : 0)
  const [drawerTab, setDrawerTab] = useState('analysis')
  const timers   = useRef([])
  const scrollRef = useRef(null)

  const clearAll  = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const jumpToEnd = () => { clearAll(); setStep(99) }

  useEffect(() => {
    if (skipToEnd) return
    const s = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
    s(() => setStep(1),  100)
    s(() => setStep(2),  1900)
    s(() => setStep(3),  3700)
    s(() => setStep(4),  5500)
    s(() => setStep(5),  7300)
    s(() => setStep(6),  9000)
    s(() => setStep(7),  12000)
    s(() => setStep(8),  15000)
    s(() => setStep(9),  18000)
    s(() => setStep(10), 18600)
    s(() => setStep(11), 19200)
    s(() => setStep(12), 19800)
    s(() => setStep(13), 20400)
    s(() => setStep(14), 22500)
    s(() => setStep(15), 28000)
    s(() => setStep(16), 28800)
    s(() => setStep(17), 29500)
    return clearAll
  }, [])

  // Auto-scroll analysis tab as content grows
  useEffect(() => {
    if (scrollRef.current && drawerTab === 'analysis') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [step])

  const isFinal          = step >= 17 || step === 99
  const visibleReasoning = step === 99 ? 5 : Math.min(step, 5)
  const visibleInsights  = step === 99 ? 3 : Math.max(0, step - 5)
  const visibleScenarios = step === 99 ? 5 : Math.max(0, step - 8)
  const showRejections   = step === 99 || step >= 14
  const hideRejected     = step === 99 || step >= 15

  const reasoningOpacity = (idx) => {
    const fromEnd = visibleReasoning - 1 - idx
    if (fromEnd === 0) return 1
    if (fromEnd === 1) return 0.6
    if (fromEnd === 2) return 0.4
    return 0.25
  }

  return (
    <div className="w-1/2 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">

      {/* ── Header: title + tabs ── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b border-gray-100 bg-white">
        <p className="font-bold text-gray-900 leading-snug mb-4 text-sm">
          План продаж:<br />
          <span className="text-base">Вся матрица Wildberries на 60 дней (06.05–04.07)</span>
        </p>
        {/* Tab bar — Figma style */}
        <div className="flex gap-1 p-0.5 border border-[#f4f4f4] rounded w-fit">
          {DRAWER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setDrawerTab(tab.id)}
              className={`px-5 py-2 text-sm font-semibold rounded transition-all whitespace-nowrap ${
                drawerTab === tab.id
                  ? 'bg-white border border-[#bfbfbf] text-[#2b2b2b] shadow-sm'
                  : 'text-[#808080] hover:text-[#404040]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">

        {/* ── АНАЛИЗ ── */}
        {drawerTab === 'analysis' && (
          <div className="px-5 py-5 space-y-6">
            {!isFinal && (
              <div className="flex justify-end">
                <button onClick={jumpToEnd} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Пропустить
                </button>
              </div>
            )}
            {visibleReasoning > 0 && (
              <div className="border-l-2 border-gray-200 pl-4 space-y-2.5">
                {REASONING_LINES.slice(0, visibleReasoning).map((line, idx) => (
                  <p key={idx} className="text-sm text-gray-600 fade-in-up"
                    style={{ opacity: reasoningOpacity(idx), transition: 'opacity 0.4s ease' }}>
                    • {line}
                  </p>
                ))}
              </div>
            )}
            {visibleInsights > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Найдено</p>
                <div className="space-y-2">
                  {INSIGHT_CARDS.slice(0, visibleInsights).map((card, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2.5 fade-in-up">
                      {card.icon === 'TrendingUp'    && <TrendingUp    size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                      {card.icon === 'AlertCircle'   && <AlertCircle   size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                      {card.icon === 'AlertTriangle' && <AlertTriangle size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                      <p className="text-sm text-gray-700">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {visibleScenarios > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Подбираю сценарии</p>
                <div className="space-y-2">
                  {SCENARIO_CANDIDATES.slice(0, visibleScenarios).map((sc) => {
                    const isRejected = showRejections && sc.rejected
                    const isHidden   = hideRejected   && sc.rejected
                    return (
                      <div key={sc.id} className="fade-in-up" style={{
                        maxHeight: isHidden ? 0 : '160px',
                        opacity: isHidden ? 0 : 1,
                        overflow: 'hidden',
                        marginBottom: isHidden ? 0 : undefined,
                        transition: 'max-height 0.4s ease, opacity 0.4s ease, margin 0.4s ease',
                      }}>
                        <div className={`border rounded-lg p-4 ${isRejected ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}`}>
                          <p className={`text-sm font-medium leading-snug ${isRejected ? 'line-through text-gray-400' : 'text-gray-900'}`}>{sc.name}</p>
                          <p className={`text-xs mt-1 leading-relaxed ${isRejected ? 'line-through text-gray-300' : 'text-gray-500'}`}>{sc.desc}</p>
                          {isRejected && sc.reason && (
                            <p className="text-xs text-red-400 mt-1.5" style={{ opacity: 0.8 }}>{sc.reason}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── СТРАТЕГИЯ ── */}
        {drawerTab === 'strategy' && (
          <div className="px-6 py-5 space-y-5">
            {/* Текущая экономика */}
            <div>
              <p className="text-sm font-semibold text-[#404040] mb-3">Текущая экономика (05.04–05.05)</p>
              <div className="border border-[#eaeaea] rounded-xl overflow-hidden">
                {STRATEGY_ECONOMY.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${row.highlight ? 'border-t border-amber-100 bg-amber-50' : ''}`}>
                    <span className="text-[#6b6b6b]">{row.label}</span>
                    <span className={`font-semibold ${row.highlight ? 'text-amber-700' : 'text-[#2b2b2b]'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ключевая проблема */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-[#2b2b2b] leading-relaxed">
              <span className="font-semibold">Ключевая проблема: </span>
              продажи есть, но почти вся прибыль съедается рекламой, комиссией, логистикой и платным хранением. Стратегия — не резкое наращивание оборота, а управляемое улучшение экономики через оптимизацию рекламы, защиту цены и контроль акций.
            </div>

            {/* По артикулам */}
            <div>
              <p className="text-sm font-semibold text-[#404040] mb-3">Анализ по артикулам</p>
              <div className="space-y-2.5">
                {STRATEGY_ARTICLES.map(art => (
                  <div key={art.id} className="border border-[#eaeaea] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#808080]">Артикул {art.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${art.marginP.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {art.marginP}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-[#6b6b6b] mb-2">
                      <span>Продажи: <span className="text-[#2b2b2b] font-medium">{art.sales}</span></span>
                      <span>Остаток: <span className="text-[#2b2b2b] font-medium">{art.stock}</span></span>
                      <span>Маржа: <span className={`font-medium ${art.margin.startsWith('−') ? 'text-red-500' : 'text-green-600'}`}>{art.margin}</span></span>
                    </div>
                    <p className="text-xs text-[#6b6b6b] leading-relaxed">{art.verdict}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Логика плана */}
            <div>
              <p className="text-sm font-semibold text-[#404040] mb-3">Логика реализации плана</p>
              <div className="space-y-2">
                {PLAN_PHASES.map((phase, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-20 text-xs font-semibold text-purple-600 pt-0.5">{phase.days}</span>
                    <span className="text-[#404040] leading-relaxed">{phase.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ЦЕЛИ ── */}
        {drawerTab === 'goals' && (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm font-semibold text-[#404040]">Цели плана на 60 дней (06.05–04.07)</p>

            {/* KPI карточки */}
            <div className="grid grid-cols-2 gap-3">
              {GOALS_KPIS.map((kpi, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* График маржинальности */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">Плановый рост маржинальности, %</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={WEEKLY_PLAN} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 20]} />
                  <Tooltip formatter={(v, name) => [`${v}%`, name]} labelFormatter={v => `${v} (${WEEKLY_PLAN.find(w => w.week === v)?.dates})`} />
                  <Line type="monotone" dataKey="marginP" name="Маржинальность" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Недельный план */}
            <div>
              <p className="text-xs font-semibold text-[#404040] mb-2">Недельный план маржи</p>
              <div className="border border-[#eaeaea] rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-[#808080]">
                  <span>Неделя</span><span>Даты</span><span className="text-right">Маржа / Маржинальность</span>
                </div>
                {WEEKLY_PLAN.map((row, i) => (
                  <div key={i} className={`grid grid-cols-3 px-4 py-2.5 text-xs border-t border-[#f4f4f4] ${i === WEEKLY_PLAN.length - 1 ? 'bg-purple-50 font-semibold' : ''}`}>
                    <span className="text-[#2b2b2b]">{row.week}</span>
                    <span className="text-[#808080]">{row.dates}</span>
                    <span className="text-right text-[#2b2b2b]">{row.margin.toLocaleString('ru')} ₽ / {row.marginP}%</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 px-4 py-2.5 text-xs border-t border-purple-200 bg-purple-50 font-semibold">
                  <span className="text-purple-900" colSpan={2}>Итого</span>
                  <span /><span className="text-right text-purple-900">42 330 ₽ → 18,5%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── СЦЕНАРИИ ── */}
        {drawerTab === 'scenarios' && (
          <div className="px-6 py-5">
            <p className="text-sm font-semibold text-[#404040] mb-4">Сценарии автоматизации через агентов</p>
            <div className="space-y-3">
              {SCENARIOS_PROPOSAL.map((sc, i) => (
                <div key={sc.id} className="bg-white border border-[#eaeaea] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#808080]">Сценарий {i + 1}</p>
                  <div>
                    <p className="font-bold text-[#2b2b2b] text-base leading-snug">{sc.name}</p>
                    <p className="text-xs text-[#2b2b2b] mt-1 leading-relaxed font-medium">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 border border-[#bfbfbf] rounded-lg px-2 py-1">
                      <Zap size={12} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-[#2b2b2b]">{sc.agent}</span>
                    </div>
                    <span className="text-xs text-[#6b6b6b]">
                      <span className="font-semibold">Охват:</span>{' '}
                      <span style={{ color: '#b869af' }}>{sc.coverage}</span>
                    </span>
                    <span className="text-xs text-[#6b6b6b]">
                      <span className="font-semibold">Периодичность:</span> {sc.freq}
                    </span>
                  </div>
                  {sc.algorithm && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-[#808080] leading-relaxed">{sc.algorithm}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-[#6b6b6b] leading-relaxed">
                      <span className="font-semibold">Ожидаемый вклад: </span>{sc.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky footer — CTA ── */}
      <div
        className="flex-shrink-0 p-4 border-t border-gray-100 bg-white"
        style={{
          opacity:      isFinal ? 1 : 0,
          transform:    isFinal ? 'translateY(0)' : 'translateY(6px)',
          transition:   'opacity 0.4s ease-out, transform 0.4s ease-out',
          pointerEvents: isFinal ? 'auto' : 'none',
        }}
      >
        <button
          onClick={onLaunch}
          className={`w-full ${A.bg} ${A.bgHover} text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2`}
        >
          <Play size={15} />
          Запустить план
        </button>
      </div>
    </div>
  )
}

// ─── WATCHING BADGE (Фича 2) ──────────────────────────────────────────────────

function WatchingBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-purple-50 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 breathe-dot flex-shrink-0" />
      <span className="text-xs text-purple-700 font-medium">Агент ведёт план</span>
    </div>
  )
}

// ─── TOAST (Фича 3) ───────────────────────────────────────────────────────────

function ScenarioToast({ onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in on next frame
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-md max-w-sm p-4"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(12px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        <Sparkles size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Сценарий скорректирован</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            Реклама сезонной коллекции — рост CPM на 12%, увеличил бюджет на 8%
          </p>
        </div>
        <button onClick={dismiss} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors ml-1">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── PLANS LIST ───────────────────────────────────────────────────────────────


const SORT_OPTIONS = [
  { key: 'default', label: 'По умолчанию' },
  { key: 'name',    label: 'По названию' },
  { key: 'delta',   label: 'По отклонению' },
  { key: 'pct',     label: 'По выполнению' },
]

function PlansScreen({ planExists, onOpenPlan, onCreatePlan, onNavigate }) {
  const [selected, setSelected] = useState(0)
  const [sortBy, setSortBy] = useState('default')

  const sorted = [...PLANS_LIST].sort((a, b) => {
    if (sortBy === 'pct')   return b.pct - a.pct
    if (sortBy === 'delta') return b.delta - a.delta
    if (sortBy === 'name')  return a.name.localeCompare(b.name, 'ru')
    return 0
  })

  const plan = sorted[selected]

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden bg-white">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Планы продаж</h1>
          {planExists && (
            <button onClick={onCreatePlan}
              className={`flex items-center gap-2 ${A.bg} ${A.bgHover} text-white text-sm px-4 py-2 rounded-lg transition-colors`}>
              <Plus size={15} />Создать план
            </button>
          )}
        </div>

        {!planExists ? (
          /* ── Empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
              <BarChart3 size={28} className="text-purple-400" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-lg font-semibold text-gray-900 mb-2">Нет ни одного плана</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Создайте первый план продаж — агент проанализирует матрицу и предложит стратегию достижения цели
              </p>
            </div>
            <button onClick={onCreatePlan}
              className={`flex items-center gap-2 ${A.bg} ${A.bgHover} text-white text-base font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm`}>
              <Plus size={18} />Создать план продаж
            </button>
          </div>
        ) : (
          /* ── List + Detail ── */
          <div className="flex-1 flex overflow-hidden">

            {/* Left: plan list */}
            <div className="w-96 flex-shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
              {/* Sort controls */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 flex-shrink-0">Сортировка</span>
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setSelected(0) }}
                  className="flex-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-gray-300 focus:border-purple-400 transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {sorted.map((p, i) => {
                  const isActive = i === selected
                  const ahead = p.delta >= 0
                  return (
                    <div key={p.id} onClick={() => setSelected(i)}
                      className={`group/row relative px-4 py-4 cursor-pointer border-b border-gray-100 transition-colors
                        ${isActive ? 'bg-purple-50 border-l-2 border-l-purple-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                      {/* Name + hover arrow */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-500 breathe-dot' : 'bg-gray-300'}`} />
                        <p className={`text-sm font-medium leading-snug flex-1 ${isActive ? 'text-purple-900' : 'text-gray-800'}`}>
                          {p.name}
                        </p>
                        {p.canOpen && (
                          <button
                            onClick={e => { e.stopPropagation(); onOpenPlan() }}
                            className="opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0
                              w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center
                              text-gray-400 hover:text-purple-600 hover:border-purple-300"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                      {/* Metrics row */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Выполнение', value: `${p.pct}%`, color: p.pct > 100 ? 'text-green-600' : 'text-purple-600' },
                          { label: 'Отклонение', value: `${ahead ? '+' : ''}${p.delta}%`, color: ahead ? 'text-green-600' : 'text-red-500' },
                          { label: 'План', value: `${p.goal.toLocaleString('ru')} ₽`, color: 'text-gray-700' },
                          { label: 'Факт', value: `${p.current.toLocaleString('ru')} ₽`, color: 'text-gray-700' },
                        ].map(m => (
                          <div key={m.label}>
                            <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                            <p className={`text-sm font-medium ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: plan detail */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-2xl mx-auto space-y-4">

                {/* Header card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  {/* Toolbar */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 leading-snug flex-1">{plan.fullName}</h2>
                    <button
                      onClick={plan.canOpen ? onOpenPlan : undefined}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors
                        ${plan.canOpen
                          ? `${A.bg} ${A.bgHover} text-white`
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Открыть план <ArrowRight size={14} />
                    </button>
                  </div>
                  {/* Status + date */}
                  <div className="flex items-center gap-2 mb-3">
                    {plan.status === 'active'
                      ? <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">Планом управляет Агент</span>
                      : <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">Завершён</span>}
                    <span className="text-xs text-gray-400">
                      Обновлён {plan.updatedAt}{plan.status === 'active' ? ' · след. через неделю' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{plan.desc}</p>

                  {/* Metrics */}
                  <div className="mt-4 grid grid-cols-4 gap-3 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Цель по марже</p>
                      <p className="text-base font-bold text-gray-900">{plan.goal.toLocaleString('ru')} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Текущая маржа</p>
                      <p className="text-base font-bold text-gray-900">{plan.current.toLocaleString('ru')} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">До выполнения</p>
                      <p className="text-base font-bold text-gray-900">
                        {plan.remaining > 0 ? `${plan.remaining.toLocaleString('ru')} ₽` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Выполнение</p>
                      <p className={`text-base font-bold ${plan.pct > 100 ? 'text-green-600' : 'text-purple-600'}`}>{plan.pct}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${plan.pct > 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(plan.pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 ₽</span>
                      <span>{plan.goal.toLocaleString('ru')} ₽</span>
                    </div>
                  </div>

                  {/* Secondary metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Маржинальность сейчас</p>
                      <p className="text-sm font-bold text-gray-900">{plan.marginNow}%
                        <span className={`ml-1.5 text-xs font-semibold ${plan.delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {plan.delta >= 0 ? '↑' : '↓'}{Math.abs(plan.delta)}% к плану
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        {plan.status === 'active' ? 'До завершения' : 'Продолжительность'}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {plan.status === 'active' ? `${plan.daysLeft} дней` : 'Завершён'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Маржинальность по неделям, %</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={MARGIN_CHART_DATA} margin={{ top: 4, right: 12, bottom: 4, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 20]} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v, n) => [v !== null ? `${v}%` : '—', n]} labelFormatter={v => v} />
                      <Line type="linear" dataKey="план" name="План" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                      <Line type="linear" dataKey="факт" name="Факт" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen({ initialTab, onReport, onAllPlans, onNavigate }) {
  const [tab, setTab] = useState(initialTab || 'plan')
  const [expandDesc, setExpandDesc] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [modal, setModal] = useState(null)
  // mutable scenarios for correction state
  const [scenarios, setScenarios] = useState(SCENARIOS_DASHBOARD)
  // auto-publish toggle
  const [autoPublish, setAutoPublish] = useState(true)
  // correction confirmed toast
  const [correctionToast, setCorrectionToast] = useState(false)
  // info popover
  const [showInfo, setShowInfo] = useState(false)
  // breadcrumb plans dropdown
  const [showPlansDropdown, setShowPlansDropdown] = useState(false)
  // Фича 3 — toast
  const [showToast, setShowToast] = useState(false)
  const toastShown = useRef(false)

  useEffect(() => {
    if (toastShown.current) return
    toastShown.current = true
    const t1 = setTimeout(() => setShowToast(true), 14000)
    return () => clearTimeout(t1)
  }, [])

  const dismissToast = () => {
    setShowToast(false)
  }

  // Auto-hide toast after 6s
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(dismissToast, 6000)
    return () => clearTimeout(t)
  }, [showToast])

  const onConfirmCorrection = (scenarioIdx, correctionIdx) => {
    setScenarios(prev => prev.map((s, i) => {
      if (i !== scenarioIdx) return s
      return { ...s, corrections: s.corrections.filter((_, j) => j !== correctionIdx) }
    }))
    setCorrectionToast(true)
  }

  useEffect(() => {
    if (!correctionToast) return
    const t = setTimeout(() => setCorrectionToast(false), 4000)
    return () => clearTimeout(t)
  }, [correctionToast])

  const toggleAutoPublish = () => {
    if (autoPublish) {
      setModal({
        text: 'Вам нужно будет подтверждать все действия агента вручную. Это может повлиять на выполнение бизнес-стратегии.',
        confirmLabel: 'Отключить',
        cancelLabel: 'Отмена',
        onConfirm: () => { setAutoPublish(false); setModal(null) },
      })
    } else {
      setAutoPublish(true)
    }
  }

  const tabs = [
    { id: 'plan', label: 'План', icon: <BarChart3 size={14} /> },
    { id: 'scenarios', label: 'Сценарии', badge: '2', icon: <Zap size={14} /> },
    { id: 'events', label: 'События', badge: '16', icon: <List size={14} /> },
  ]

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb + header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          <div className="px-6 pt-3 pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="relative"
                  onMouseEnter={() => setShowPlansDropdown(true)}
                  onMouseLeave={() => setShowPlansDropdown(false)}>
                  <button className={`transition-colors flex items-center gap-0.5 ${showPlansDropdown ? 'text-purple-600' : 'hover:text-purple-600'}`}>
                    Планы продаж
                    <ChevronDown size={11} className={`ml-0.5 transition-opacity ${showPlansDropdown ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                  {/* Notion-style dropdown */}
                  <div className={`absolute left-0 top-full pt-1 w-72 z-50 ${showPlansDropdown ? '' : 'hidden'}`}>
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
                    <div className="p-1.5">
                      {PLANS_LIST.map(p => (
                        <button key={p.id} onClick={p.canOpen ? onAllPlans : undefined}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors
                            ${p.id === 1 ? 'bg-purple-50' : 'hover:bg-gray-50'}
                            ${!p.canOpen ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium leading-snug truncate ${p.id === 1 ? 'text-purple-900' : 'text-gray-700'}`}>
                              {p.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-gray-400">{p.pct}%</span>
                              <span className={`${p.delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {p.delta >= 0 ? '+' : ''}{p.delta}%
                              </span>
                              <span className="text-gray-300">{p.current.toLocaleString('ru')} ₽</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-1.5">
                      <button onClick={onAllPlans}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center gap-1.5">
                        <List size={11} />
                        Все планы продаж
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium truncate max-w-xs">
                  План продаж: Вся матрица Wildberries на 3 месяца (до 24.06.26)
                </span>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">Планом управляет Агент</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Auto-publish toggle */}
                <label className="flex items-center gap-2 cursor-pointer" onClick={toggleAutoPublish}>
                  <span className="text-xs text-gray-500">Публиковать без подтверждения</span>
                  <div className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${autoPublish ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${autoPublish ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </label>
                <div className="relative">
                  <button onClick={() => setShowInfo(v => !v)} className="text-gray-400 hover:text-gray-600"><Info size={16} /></button>
                  {showInfo && (
                    <div className="absolute right-0 top-7 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
                      <p className="text-xs font-semibold text-gray-900 mb-1">Публиковать без подтверждения</p>
                      <p className="text-xs text-gray-600 leading-relaxed">Когда включено — агент самостоятельно применяет все корректировки. Когда выключено — каждое действие требует вашего подтверждения вручную.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.icon}
                  {t.label}
                  {t.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'plan' && (
            <PlanTab
              expandDesc={expandDesc}
              setExpandDesc={setExpandDesc}
              onReport={onReport}
            />
          )}
          {tab === 'scenarios' && (
            <ScenariosTab
              selected={selectedScenario}
              setSelected={setSelectedScenario}
              scenarios={scenarios}
              onConfirmCorrection={onConfirmCorrection}
              onModal={setModal}
            />
          )}
          {tab === 'events' && (
            <EventsTab
              expanded={expandedEvent}
              setExpanded={setExpandedEvent}
              onModal={setModal}
            />
          )}
        </div>
      </div>

      {/* Фича 3 — toast */}
      {showToast && <ScenarioToast onDismiss={dismissToast} />}

      {/* Correction confirmed toast */}
      {correctionToast && (
        <div
          className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-md max-w-sm p-4 fade-in-up"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Корректировка подтверждена</p>
              <p className="text-sm text-gray-500 mt-0.5">Изменения применены к сценарию</p>
            </div>
            <button onClick={() => setCorrectionToast(false)} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-gray-900 text-sm">Подтвердите действие</p>
              <button onClick={() => setModal(null)}><X size={16} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">{modal.text}</p>
            {modal.changes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-2">
                {modal.changes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{c.label}</span>
                    <span className="font-medium text-gray-900">{c.from} → {c.to}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => modal.onConfirm ? modal.onConfirm() : setModal(null)}
                className={`flex-1 ${A.bg} ${A.bgHover} text-white text-sm py-2.5 rounded-lg font-medium transition-colors`}
              >
                {modal.confirmLabel || 'Подтвердить'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                {modal.cancelLabel || 'Отклонить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CHART_ACTIONS = [
  { key: 'actReviews',  label: 'Отзывы',    color: '#ddd6fe', total: 22 },
  { key: 'actClusters', label: 'Кластеры',  color: '#c4b5fd', total: 8  },
  { key: 'actPrice',    label: 'Изм. цены', color: '#7c3aed', total: 14 },
]

function PlanTab({ expandDesc, setExpandDesc, onReport }) {
  const [editingName, setEditingName] = useState(false)
  const [planName, setPlanName] = useState('Вся матрица Wildberries — 60 дней (06.05–04.07)')

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Plan card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-2">
            {editingName ? (
              <input
                autoFocus
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                className="text-lg font-bold text-gray-900 leading-snug border-b-2 border-purple-400 outline-none bg-transparent flex-1 mr-4 pb-0.5"
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                План продаж:<br />{planName}
              </h2>
            )}
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <button onClick={onReport} className={`text-xs ${A.bg} ${A.bgHover} text-white px-3 py-1.5 rounded-lg transition-colors`}>
                Показать отчёт
              </button>
              <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600"><Edit3 size={16} /></button>
            </div>
          </div>
          <p className={`text-sm text-gray-600 leading-relaxed ${!expandDesc ? 'line-clamp-2' : ''}`}>
            Стартовая точка — маржинальность 0,7% при ДРР 18,9%. Цель плана: довести маржу до 18,5% за 60 дней за счёт трёх рычагов. Первый — управление ценой: артикул 14433381 показывает устойчивый спрос, на нём можно поэтапно поднять цену на 2–3% без потери заказов. Второй — фильтрация акций: участвуем только там, где маржа после скидки остаётся положительной. Третий — оптимизация рекламы: отключаем неэффективные кампании, снижая ДРР с 18,9% до целевых 12–13%.
          </p>
          <button onClick={() => setExpandDesc(!expandDesc)} className="mt-1 text-xs text-purple-600 flex items-center gap-1">
            {expandDesc ? <><ChevronUp size={12} />Свернуть</> : <><ChevronDown size={12} />Развернуть</>}
          </button>
          <p className="mt-2 text-xs text-gray-400">Обновлён 25.05 · Следующее обновление через неделю</p>

          {/* Metrics */}
          <div className="mt-5 grid grid-cols-4 gap-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Цель по марже</p>
              <p className="text-lg font-bold text-gray-900">42 330 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Текущая маржа</p>
              <p className="text-lg font-bold text-gray-900">14 100 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">До выполнения плана</p>
              <p className="text-lg font-bold text-gray-900">28 230 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Процент выполнения</p>
              <p className="text-lg font-bold text-purple-600">33%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>0 ₽</span>
              <span className="text-purple-500 font-medium">33% выполнено</span>
              <span>42 330 ₽</span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                style={{ width: '33%' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-gray-500">Накоплено: <span className="font-medium text-gray-700">14 100 ₽</span></span>
              <span className="text-gray-400">Осталось: <span className="font-medium text-gray-600">28 230 ₽</span></span>
            </div>
          </div>

          {/* Progress + deviation */}
          <div className="mt-5 grid grid-cols-2 gap-5 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">До завершения плана</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">31 день</p>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-purple-400 rounded-full" style={{ width: '48%' }} />
                <div className="absolute h-4 w-0.5 bg-purple-600 top-1/2 -translate-y-1/2" style={{ left: '48%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span><span>30</span><span>60</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Маржинальность сейчас</p>
              <p className="text-2xl font-bold text-green-600 mb-2">13,1%</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${(13.1 / 18.5) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">цель 18,5%</span>
              </div>
              <p className="text-xs text-green-600 mt-1.5">+0,3 п.п. к плану нед. 4</p>
            </div>
          </div>
        </div>

        {/* Chart + agent actions strip */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 pt-5 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 mr-2">Маржинальность по неделям, %</p>
              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t-2 border-dashed border-gray-300" />
                <span className="text-xs text-gray-500">План</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t-2 border-purple-600" />
                <span className="text-xs text-gray-500">Факт</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={MARGIN_CHART_DATA} margin={{ top: 4, right: 16, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 20]} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, name) => [v !== null ? `${v}%` : '—', name]} labelFormatter={v => v} />
                <Line type="linear" dataKey="план" name="План" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line type="linear" dataKey="факт" name="Факт" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Agent actions summary strip */}
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Всего действий агента:</span>
                <span className="text-sm font-bold text-gray-900">44</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              {CHART_ACTIONS.map(a => (
                <div key={a.key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: a.color }} />
                  <span className="text-xs text-gray-600">{a.label}: <span className="font-medium text-gray-800">{a.total}</span></span>
                </div>
              ))}
          </div>
        </div>

        {/* Weekly breakdown table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Недельный план / факт</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-[#808080]">
                  <th className="px-4 py-2.5 text-left font-semibold">Неделя</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Даты</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Маржа план</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Маржа факт</th>
                  <th className="px-4 py-2.5 text-right font-semibold">% план</th>
                  <th className="px-4 py-2.5 text-right font-semibold">% факт</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Отклонение</th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY_PLAN.map((row, i) => {
                  const hasFact = row.factMargin !== null
                  const delta = hasFact ? row.factMarginP - row.marginP : null
                  const isCurrent = i === 3 // текущая неделя — Нед 4
                  return (
                    <tr key={i} className={`border-t border-[#f4f4f4] ${isCurrent ? 'bg-purple-50 font-semibold' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-2.5 text-[#2b2b2b]">{row.week}</td>
                      <td className="px-4 py-2.5 text-[#808080]">{row.dates}</td>
                      <td className="px-4 py-2.5 text-right text-[#2b2b2b]">{row.margin.toLocaleString('ru')} ₽</td>
                      <td className="px-4 py-2.5 text-right">
                        {hasFact
                          ? <span className="text-[#2b2b2b]">{row.factMargin.toLocaleString('ru')} ₽</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#808080]">{row.marginP}%</td>
                      <td className="px-4 py-2.5 text-right">
                        {hasFact
                          ? <span className="text-[#2b2b2b]">{row.factMarginP}%</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {delta !== null
                          ? <span className={delta >= 0 ? 'text-green-600' : 'text-red-500'}>
                              {delta >= 0 ? '+' : ''}{delta.toFixed(1)} п.п.
                            </span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScenariosTab({ selected, setSelected, scenarios, onConfirmCorrection, onModal }) {
  const sc = scenarios[selected]

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left list */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-white py-3">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelected(i)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${selected === i ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === i ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
              {s.icon}
            </div>
            <p className={`text-xs leading-snug ${selected === i ? 'text-purple-800 font-medium' : 'text-gray-700'}`}>{s.name}</p>
          </button>
        ))}
      </div>

      {/* Right detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{sc.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{sc.desc}</p>
            <span className="inline-block text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-3 py-1 mb-4">
              {sc.agent}
            </span>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Алгоритм сценария:</span> {sc.algorithm}</p>
              <p><span className="font-semibold text-gray-900">Ожидаемый вклад:</span> {sc.impact}</p>
              <p><span className="font-semibold text-gray-900">Охват:</span> <span className="text-purple-600">{sc.coverage}</span></p>
              <p><span className="font-semibold text-gray-900">Периодичность:</span> {sc.freq}</p>
            </div>
          </div>

          {/* Corrections */}
          {sc.corrections.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Корректировки сценария</p>
              </div>
              <div className="divide-y divide-gray-100">
                {sc.corrections.map((c, i) => (
                  <div key={i} className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{c.date} {c.time}</span>
                      <button
                        onClick={() => onConfirmCorrection(selected, i)}
                        className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Check size={12} />
                        Подтвердить
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.text}</p>
                    {c.changes.map((ch, j) => (
                      <div key={j} className="bg-gray-50 rounded-lg px-4 py-3 mb-2">
                        <p className="text-xs text-gray-500 mb-1">{ch.label}</p>
                        <p className="text-sm font-medium text-gray-900">{ch.from} → {ch.to}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {sc.corrections.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-400 text-center">
              Корректировок пока нет — сценарий работает без изменений
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-14 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => onModal({ text: 'Опубликовать все корректировки сценариев? Это действие применится ко всем ожидающим корректировкам.' })}
          className={`flex items-center gap-2 ${A.bg} ${A.bgHover} text-white text-sm px-4 py-2 rounded-lg transition-colors`}
        >
          <Check size={14} />
          Опубликовать все
        </button>
        <button
          onClick={() => onModal({ text: 'Пропустить все ожидающие корректировки? Агент продолжит работу без применения изменений.', confirmLabel: 'Пропустить все', cancelLabel: 'Отмена' })}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Play size={14} />
          Пропустить все
        </button>
      </div>
    </div>
  )
}

function EventsTab({ expanded, setExpanded, onModal }) {
  const [showFilter, setShowFilter] = useState(false)
  const [filterStatus, setFilterStatus] = useState([])
  const allStatuses = ['Ждёт проверки', 'Успешно', 'Ошибки']
  const toggleStatus = (s) => setFilterStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Controls */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-sm text-gray-400">
          <span>🔍</span>
          <input className="outline-none bg-transparent text-sm w-36 placeholder-gray-400" placeholder="Поиск" />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`border rounded-lg p-1.5 transition-colors ${showFilter ? 'border-purple-400 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
          >
            <Settings size={16} />
          </button>
          {showFilter && (
            <div className="absolute left-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-52">
              <p className="text-xs font-semibold text-gray-700 mb-2">Фильтр по статусу</p>
              {allStatuses.map(s => (
                <label key={s} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterStatus.includes(s)}
                    onChange={() => toggleStatus(s)}
                    className="accent-purple-600"
                  />
                  <span className="text-xs text-gray-700">{s}</span>
                </label>
              ))}
              {filterStatus.length > 0 && (
                <button onClick={() => setFilterStatus([])} className="mt-1 text-xs text-purple-600 hover:underline">
                  Сбросить
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5">01.06.25 - 01.07.25</span>
        <button className="border border-gray-200 rounded-lg p-1.5 text-gray-400"><Download size={16} /></button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3 w-28">Время</th>
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Сценарий</th>
              <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Результат</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {EVENTS.map(ev => (
              <React.Fragment key={ev.id}>
                <tr
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                >
                  <td className="px-6 py-3 align-top">
                    <p className="text-sm font-medium text-gray-900">{ev.time}</p>
                    <p className="text-xs text-gray-400">{ev.date}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2 mb-0.5">
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${expanded === ev.id ? 'rotate-90' : ''}`} />
                      <p className="text-sm font-medium text-gray-900">{ev.scenario}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 pl-5">{ev.desc}</p>
                  </td>
                  <td className="px-6 py-3 align-top">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        Ждёт проверки {ev.pending}
                      </span>
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">Ошибки {ev.errors}</span>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">Успешно {ev.success}</span>
                    </div>
                  </td>
                </tr>

                {/* Expanded items */}
                {expanded === ev.id && ev.items.map(item => (
                  <React.Fragment key={item.id}>
                    <tr className="bg-purple-50/30">
                      <td className="px-6 py-3 align-top pl-10" />
                      <td className="px-4 py-3 align-top" colSpan={2}>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                            <Package size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">WB {item.id} · {item.brand}</p>
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">Ждёт проверки {item.pending}</span>
                            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">Успешно {item.success}</span>
                          </div>
                        </div>
                        {/* Sub ops */}
                        <div className="mt-3 ml-11 space-y-2">
                          {item.ops.map((op, j) => (
                            <div key={j} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  {op.type && <p className="text-xs text-gray-400">{op.type}</p>}
                                  <p className="text-sm font-medium text-gray-800">{op.name}</p>
                                </div>
                                <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded px-2 py-0.5">{op.status}</span>
                              </div>
                              <p className="text-xs text-gray-500">{op.detail}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => onModal({ text: 'Опубликовать все операции, ожидающие проверки? Это действие применится ко всем 16 событиям.', changes: [] })}
          className={`flex items-center gap-2 ${A.bg} ${A.bgHover} text-white text-sm px-4 py-2 rounded-lg transition-colors`}
        >
          <Check size={14} />
          Опубликовать все
        </button>
        <button
          onClick={() => onModal({ text: 'Пропустить все 16 операций, ожидающих проверки? Агент продолжит работу без применения изменений.', confirmLabel: 'Пропустить все', cancelLabel: 'Отмена' })}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Play size={14} />
          Пропустить все
        </button>
        <span className="text-xs text-gray-400 ml-2">Применится ко всем операциям на проверке</span>
      </div>
    </div>
  )
}

// ─── REPORT ──────────────────────────────────────────────────────────────────

function ReportScreen({ onBack, onNavigate }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans onNavigate={onNavigate} />
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
          {/* Hero */}
          <div className="text-center py-6">
            <p className="text-2xl font-bold text-gray-900 leading-snug mb-4">
              «Вся матрица Wildberries на 3 месяца» (до 24.06.26)<br />план продаж завершился, цели достигнуты! 🎉
            </p>
            <div className="flex items-center justify-center gap-10">
              <div>
                <p className="text-xs text-gray-400 mb-1">Итоговые продажи</p>
                <p className="text-2xl font-bold text-purple-600">1 328 832 002 ₽</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Процент выполнения</p>
                <p className="text-2xl font-bold text-green-600">126%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>567 343 ₽ продажи за март</span>
              <span>1 128 567 343 ₽ целевые продажи</span>
            </div>
          </div>

          {/* Deviation bars */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500 mb-3">Отклонение от плана</p>
            <div className="flex items-center gap-4">
              <p className="text-xl font-bold text-green-600">+21%</p>
              <div className="flex-1 flex gap-1 h-6">
                <div className="bg-red-200 rounded text-xs flex items-center justify-center text-red-600 font-medium" style={{ width: '20%' }}>-4%</div>
                <div className="bg-green-200 rounded text-xs flex items-center justify-center text-green-600 font-medium" style={{ width: '40%' }}>+27%</div>
                <div className="bg-green-300 rounded text-xs flex items-center justify-center text-green-700 font-medium" style={{ width: '40%' }}>+18%</div>
              </div>
            </div>
          </div>

          {/* Agent comment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-700 leading-relaxed space-y-3">
            <p>Достигнутый результат подтверждает эффективность подхода, основанного не на агрессивном наращивании трафика, а на системной оптимизации существующей воронки. Ключевым драйвером перевыполнения плана стало не увеличение бюджета, а повышение качества монетизации текущего спроса: за счёт селективного усиления рекламы, точечной работы с ценообразованием и улучшения коммуникации в карточках товаров.</p>
            <p>Модель доказала свою устойчивость: рост выручки на 200 млн ₽ обеспечен без демпинга, без риска для маржинальности и без зависимости от «рыночных» влияний в трафик. Сформированная конфигурация матрицы и отлаженные механики управления ДРР создают надёжную базу для масштабирования в следующих периодах.</p>
          </div>

          {/* Metrics table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Итоговая метрическая картина</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Период', 'Продажи ₽', 'Заказы ₽', 'Заказы шт.', 'Маржа ₽', 'Марж-сть %'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REPORT_ROWS.map((r, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${r.isTotal ? 'bg-purple-50 font-semibold' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-gray-900 font-medium">{r.period}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{r.sales}</p>
                        {r.salesD && <p className="text-xs text-green-600">{r.salesD}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{r.orders}</p>
                        {r.ordersD && <p className="text-xs text-green-600">{r.ordersD}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{r.ordersN}</p>
                        {r.ordersND && <p className="text-xs text-green-600">{r.ordersND}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{r.margin}</p>
                        {r.marginD && <p className="text-xs text-green-600">{r.marginD}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{r.marginP}</p>
                        {r.marginPD && <p className="text-xs text-green-600">{r.marginPD}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success factors */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Факторы успеха по этапам реализации</p>
            {[
              {
                label: 'Блок 1 (Дни 1–30): Оптимизация и быстрые победы',
                items: [
                  'Проведена ревизия рекламного портфеля: 38% бюджета перераспределено с низкоэффективных SKU на позиции с маржинальностью >25% и CTR >4,2%',
                  'Реализована программа работы с контентом: обновлены карточки товаров, добавлено 142 ответа на вопросы, интегрированы пользовательские сценарии в визуальный ряд',
                  'Результат: снижение уровня сомнений у покупателей на ~30%, рост конверсии в корзину до 3,7%',
                ],
              },
              {
                label: 'Блок 2 (Дни 31–60): Масштабирование проверенных гипотез',
                items: [
                  'Отключено 19% неэффективных ключевых слов и рекламных объявлений, высвободившийся бюджет направлен на рабочие связки',
                  'Зафиксирован рост повторных заказов на 14% за счёт улучшения качества карточек и точности таргетинга',
                ],
              },
              {
                label: 'Блок 3 (Дни 61–90): Консолидация и работа с матрицей',
                items: [
                  'Сфокусирована работа на товарах с высокой конверсией и выкупом, что позволило удержать маржинальность на целевом уровне',
                  'Для 20 изначально убыточных позиций проведена комплексная работа: корректировка цен до точки безубыточности, пересмотр промо-стратегии, доработка коммуникации в карточке',
                ],
              },
            ].map((block, i) => (
              <div key={i} className="mb-5 last:mb-0">
                <p className="text-xs font-semibold text-purple-700 mb-2">{block.label}</p>
                <ul className="space-y-1.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Продажи ₽</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={CHART_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit=" М" domain={[295, 400]} />
                <Tooltip formatter={(v, name) => [v ? `${v} млн ₽` : '—', name]} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="base" name="Динамика до плана" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="plan" name="План" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="fact" name="Факт" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← Вернуться к дашборду
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DEMO PANEL ───────────────────────────────────────────────────────────────

function DemoPanel({ onJump }) {
  const btns = [
    { label: 'Старт', target: 'start' },
    { label: 'Чат: начало', target: 'chat-start' },
    { label: 'Чат: конец', target: 'chat-full' },
    { label: 'Чат + drawer', target: 'chat-drawer' },
    { label: 'Планы: пусто', target: 'plans-empty' },
    { label: 'Планы: список', target: 'plans' },
    { label: 'Дашборд: план', target: 'dash-plan' },
    { label: 'Дашборд: сценарии', target: 'dash-scenarios' },
    { label: 'Дашборд: события', target: 'dash-events' },
    { label: 'Отчёт', target: 'report' },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
      <span className="text-gray-600 text-xs font-bold mr-2 flex-shrink-0 uppercase tracking-widest">Demo</span>
      {btns.map(b => (
        <button
          key={b.target}
          onClick={() => onJump(b.target)}
          className="flex-shrink-0 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors"
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('start')
  const [chatKey, setChatKey] = useState(0)
  const [chatPreset, setChatPreset] = useState('start')
  const [chatTask, setChatTask] = useState('')
  const [dashTab, setDashTab] = useState('plan')
  const [dashKey, setDashKey] = useState(0)
  const [planExists, setPlanExists] = useState(false)

  const jumpTo = (target) => {
    if (target === 'start') {
      setScreen('start')
    } else if (target === 'chat-start') {
      setChatPreset('start')
      setChatTask('Хочу поднять продажи на Wildberries за следующие 3 месяца по всей матрице товаров')
      setChatKey(k => k + 1)
      setScreen('chat')
    } else if (target === 'chat-full') {
      setChatPreset('full')
      setChatKey(k => k + 1)
      setScreen('chat')
    } else if (target === 'chat-drawer') {
      setChatPreset('drawer')
      setChatKey(k => k + 1)
      setScreen('chat')
    } else if (target === 'plans') {
      setPlanExists(true)
      setScreen('plans')
    } else if (target === 'plans-empty') {
      setPlanExists(false)
      setScreen('plans')
    } else if (target === 'dash-plan') {
      setPlanExists(true)
      setDashTab('plan')
      setDashKey(k => k + 1)
      setScreen('dashboard')
    } else if (target === 'dash-scenarios') {
      setPlanExists(true)
      setDashTab('scenarios')
      setDashKey(k => k + 1)
      setScreen('dashboard')
    } else if (target === 'dash-events') {
      setPlanExists(true)
      setDashTab('events')
      setDashKey(k => k + 1)
      setScreen('dashboard')
    } else if (target === 'report') {
      setScreen('report')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ paddingBottom: '40px' }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="flex-1 flex overflow-hidden">
        {screen === 'start' && (
          <StartScreen
            onNavigate={jumpTo}
            onStart={(task) => {
              setChatTask(task)
              setChatPreset('start')
              setChatKey(k => k + 1)
              setScreen('chat')
            }}
          />
        )}
        {screen === 'chat' && (
          <ChatScreen
            key={chatKey}
            initialTask={chatTask}
            preset={chatPreset}
            onNavigate={jumpTo}
            onPlanReady={() => {
              setPlanExists(true)
              setDashTab('plan')
              setDashKey(k => k + 1)
              setScreen('dashboard')
            }}
          />
        )}
        {screen === 'plans' && (
          <PlansScreen
            planExists={planExists}
            onNavigate={jumpTo}
            onOpenPlan={() => {
              setDashTab('plan')
              setDashKey(k => k + 1)
              setScreen('dashboard')
            }}
            onCreatePlan={() => {
              setChatPreset('start')
              setChatKey(k => k + 1)
              setScreen('chat')
            }}
          />
        )}
        {screen === 'dashboard' && (
          <DashboardScreen
            key={dashKey}
            initialTab={dashTab}
            onNavigate={jumpTo}
            onReport={() => setScreen('report')}
            onAllPlans={() => setScreen('plans')}
          />
        )}
        {screen === 'report' && (
          <ReportScreen onNavigate={jumpTo} onBack={() => setScreen('dashboard')} />
        )}
      </div>
      <DemoPanel onJump={jumpTo} />
    </div>
  )
}
