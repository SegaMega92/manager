import React, { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  BarChart3, Bell, Settings, ChevronDown, ChevronUp, X, Check,
  SkipForward, CheckCircle2, AlertCircle, Clock, Zap, List,
  ChevronRight, ArrowRight, Edit3, Info, Play, Plus, Download,
  ShoppingBag, Tag, Package, Eye, MessageSquare, Star, Megaphone,
  TrendingUp, AlertTriangle, Sparkles
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
  'Загружаю матрицу — 247 SKU',
  'Сверяю с историей продаж за 12 месяцев',
  'Считаю эластичность по категориям',
  'Проверяю сезонность: пик через 6 недель',
  'Сопоставляю с целевой ДРР 18%',
]

const INSIGHT_CARDS = [
  { icon: 'TrendingUp',    text: '23 SKU с потенциалом роста +30%' },
  { icon: 'AlertCircle',   text: '3 товара требуют пересмотра минимальной цены' },
  { icon: 'AlertTriangle', text: 'Высокий риск каннибализации в категории «Платья»' },
]

const SCENARIO_CANDIDATES = [
  { id: 1, name: 'Агрессивная реклама всей матрицы',             desc: 'Подключить рекламу ко всем 247 SKU, повышенные ставки',     rejected: true,  reason: 'Превышение целевой ДРР на 4.8%' },
  { id: 2, name: 'Ценовая война с конкурентом',                  desc: 'Снижение цен на топ-20 SKU ниже рыночных',                 rejected: true,  reason: 'Риск падения маржи ниже 12%' },
  { id: 3, name: 'Точечная реклама топ-23 SKU',                  desc: 'Усиленная реклама товаров с потенциалом +30%',              rejected: false },
  { id: 4, name: 'Динамическое ценообразование сезонной коллекции', desc: 'Гибкие цены под пик сезона через 6 недель',              rejected: false },
  { id: 5, name: 'Стимулирование отзывов на низкомаржинальных SKU', desc: 'Автозапросы отзывов, повышение конверсии',               rejected: false },
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
    name: 'Масштабирование сильных SKU через рекламу',
    agent: 'Агент Рекламы',
    desc: 'Основной источник прироста заказов. Масштабируются товары, которые уже показывают сильную экономику и хорошую конверсию.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽',
    coverage: '14 из 100 SKU',
    freq: '1 раз в день',
  },
  {
    id: 2,
    name: 'Ценовая донастройка SKU с трафиком, но слабой конверсией',
    agent: 'Агент Ценообразования',
    desc: 'Добирает там, где карточка уже получает трафик, но часть спроса теряется на цене.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽',
    coverage: '24 из 100 SKU',
    freq: '1 раз в день',
  },
  {
    id: 3,
    name: 'Точечное участие в акциях по товарам с хорошим выкупом',
    agent: 'Агент Акций',
    desc: 'Ускоряет оборот и даёт дополнительный объём заказов без массового демпинга по всей матрице.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽',
    coverage: '14 из 100 SKU',
    freq: '1 раз в день',
  },
  {
    id: 4,
    name: 'Управление отзывами для роста доверия и выкупа',
    agent: 'Агент Отзывов',
    desc: 'Повышает рейтинг карточек через своевременные ответы и работу с негативом.',
    impact: 'в заказах +3 200 шт. (+12,0 млн ₽), в марже +2,1 млн ₽',
    coverage: 'вся матрица',
    freq: '2 раза в день',
  },
  {
    id: 5,
    name: 'Ответы на вопросы для снятия барьеров покупки',
    agent: 'Агент Контента',
    desc: 'Снижает количество потерянных сделок из-за отсутствия ответов на вопросы покупателей.',
    impact: 'в конверсии +0,3 п.п., в заказах +2 100 шт.',
    coverage: 'вся матрица',
    freq: '1 раз в день',
  },
]

const SCENARIOS_DASHBOARD = [
  {
    id: 1,
    name: 'Масштабирование сильных SKU через рекламу',
    icon: <Megaphone size={16} />,
    agent: 'Агент Рекламы',
    desc: 'Основной источник прироста заказов. Масштабируются товары, которые уже показывают сильную экономику и хорошую конверсию.',
    algorithm: 'ежедневно проверять CTR, конверсию клик→заказ, ДРР и позицию в рекламе; повышать ставки на 2–4 ₽ для SKU с CTR выше медианы и маржой выше 12%; добавлять поисковые фразы, которые дают заказы; отключать ключи с кликами без заказов; перераспределять бюджет из слабых SKU в сильные; удерживать рекламные позиции в диапазоне, где рост трафика не ломает экономику.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽, в маржинальности +0,4 п.п.',
    coverage: '14 из 100 SKU',
    freq: '1 раз в день',
    corrections: [
      {
        date: '12.05.25', time: '22:32',
        text: 'Сценарий удерживает завышенную цену на SKU с остатком 12–14 дней, что тормозит продажи на -18% vs плановый темп. При 14 оставшихся днях приоритет смещается с защиты позиций на выполнение плана — порог триггера нужно опустить с 15 до 9 дней, чтобы ценовой тормоз включался только при реальной угрозе OOS, а не профилактически.',
        changes: [{ label: 'Порог до OOS', from: '15 шт.', to: '9 шт.' }, { label: 'Шаг изменения цены', from: '10%', to: '15%' }],
      },
      {
        date: '12.05.25', time: '22:32',
        text: 'SKU с индексом остатка 65–75 дней удерживаются в диапазоне 40–60 дней слишком мягкой ценовой коррекцией (−3–5%), что недостаточно для ускорения оборачиваемости за 14 дней. Более агрессивное снижение цены сократит индекс до целевого уровня и высвободит оборотные средства до дедлайна.',
        changes: [{ label: 'Шаг изменения цены', from: '5%', to: '10%' }],
      },
    ],
  },
  {
    id: 2,
    name: 'Ценовая донастройка SKU с трафиком, но слабой конверсией',
    icon: <Tag size={16} />,
    agent: 'Агент Ценообразования',
    desc: 'Добирает там, где карточка уже получает трафик, но часть спроса теряется на цене.',
    algorithm: 'раз в день проверять товары с конверсией клик→заказ ниже медианы и маржой выше 12%; снижать цену на 2–5% на 3 дня для теста; если конверсия растёт — фиксировать новую цену; для SKU с сильным спросом и выкупом цену не трогать или повышать на 1–2% для сохранения экономики.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽, в маржинальности +0,4 п.п.',
    coverage: '24 из 100 SKU',
    freq: '1 раз в день',
    corrections: [
      {
        date: '05.05.25', time: '10:15',
        text: 'Конверсия по 8 SKU выросла после снижения цен на 3%, фиксируем новые уровни. Маржа сохраняется в допустимых границах.',
        changes: [{ label: 'Статус', from: 'тест', to: 'зафиксировано' }],
      },
    ],
  },
  {
    id: 3,
    name: 'Точечное участие в акциях по товарам с хорошим выкупом',
    icon: <Star size={16} />,
    agent: 'Агент Акций',
    desc: 'Ускоряет оборот и даёт дополнительный объём заказов без массового демпинга по всей матрице.',
    algorithm: 'раз в день проверять товары с конверсией клик→заказ ниже медианы и маржой выше 12%; снижать цену на 2–5% на 3 дня для теста.',
    impact: 'в заказах +14 500 шт. (+60,0 млн ₽), в продажах +52,0 млн ₽, в марже +10,2 млн ₽, в маржинальности +0,4 п.п.',
    coverage: '14 из 100 SKU',
    freq: '1 раз в день',
    corrections: [],
  },
  {
    id: 4,
    name: 'Управление отзывами для роста доверия и выкупа',
    icon: <Star size={16} />,
    agent: 'Агент Отзывов',
    desc: 'Повышает рейтинг карточек через своевременные ответы и работу с негативом.',
    algorithm: 'ежедневно мониторить новые отзывы; автоматически отвечать на позитивные; эскалировать критический негатив (1–2 звезды) для ручной обработки; запрашивать оценки у покупателей через 7 дней после доставки.',
    impact: 'в заказах +3 200 шт. (+12,0 млн ₽), в марже +2,1 млн ₽',
    coverage: 'вся матрица',
    freq: '2 раза в день',
    corrections: [],
  },
  {
    id: 5,
    name: 'Ответы на вопросы для снятия барьеров покупки',
    icon: <MessageSquare size={16} />,
    agent: 'Агент Контента',
    desc: 'Снижает количество потерянных сделок из-за отсутствия ответов на вопросы покупателей.',
    algorithm: 'ежедневно проверять новые вопросы; формировать ответы на основе описания товара и частых обращений; публиковать ответы с акцентом на преимущества и вдохновляющий стиль.',
    impact: 'в конверсии +0,3 п.п., в заказах +2 100 шт.',
    coverage: 'вся матрица',
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

const NAV_ICONS = [
  { icon: <Eye size={18} />, label: 'Мониторинг' },
  { icon: <BarChart3 size={18} />, label: 'Планы', active: true },
  { icon: <Package size={18} />, label: 'Товары' },
  { icon: <Tag size={18} />, label: 'Цены' },
  { icon: <ShoppingBag size={18} />, label: 'Заказы' },
  { icon: <Megaphone size={18} />, label: 'Реклама' },
  { icon: <MessageSquare size={18} />, label: 'Отзывы' },
  { icon: <Star size={18} />, label: 'Акции' },
  { icon: <TrendingUp size={18} />, label: 'Аналитика' },
  { icon: <Settings size={18} />, label: 'Настройки' },
]

function Sidebar({ highlightPlans }) {
  return (
    <div className="w-14 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-1">
      <div className="w-9 h-9 flex items-center justify-center mb-3">
        <span className="font-black text-gray-900 text-lg leading-none">Ĵ</span>
      </div>
      {NAV_ICONS.map((item, i) => (
        <div
          key={i}
          title={item.label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors
            ${(item.active && highlightPlans) ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
        >
          {item.icon}
        </div>
      ))}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
          <Bell size={18} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer flex items-center justify-center text-xs font-medium text-gray-600">
          WO
        </div>
      </div>
    </div>
  )
}

// ─── START SCREEN ─────────────────────────────────────────────────────────────

function StartScreen({ onStart }) {
  const [task, setTask] = useState('')

  return (
    <div className="flex-1 flex">
      <Sidebar highlightPlans={false} />
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

function ChatScreen({ initialTask, preset, onPlanReady }) {
  // preset: 'start' | 'full' | 'drawer'
  const isFullOrDrawer = preset === 'full' || preset === 'drawer'
  const [visible, setVisible] = useState(() => isFullOrDrawer ? CHAT_SCRIPT.map(s => s.id) : [0])
  const [step, setStep] = useState(() => isFullOrDrawer ? CHAT_SCRIPT.length : 1)
  const [typing, setTyping] = useState(false)
  const [showPanel, setShowPanel] = useState(preset === 'drawer')
  // skipAnalysis=true → AnalysisPanel starts in final state (from demo jump)
  const skipAnalysis = preset === 'drawer'
  const bottomRef = useRef(null)

  const handleShurshi = () => setShowPanel(true)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visible, typing])

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
      <Sidebar highlightPlans={false} />
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
              {step >= CHAT_SCRIPT.length && !showPanel && (
                <button
                  onClick={handleShurshi}
                  className={`w-full ${A.bg} ${A.bgHover} text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4`}
                >
                  Давай, шурши
                  <ArrowRight size={15} />
                </button>
              )}
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

function AnalysisPanel({ skipToEnd, onLaunch }) {
  const [step, setStep] = useState(skipToEnd ? 99 : 0)
  const timers = useRef([])
  const scrollRef = useRef(null)

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const jumpToEnd = () => { clearAll(); setStep(99) }

  useEffect(() => {
    if (skipToEnd) return
    const s = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
    // Act 1 — reasoning lines (~0–9s)
    s(() => setStep(1),  100)
    s(() => setStep(2),  1900)
    s(() => setStep(3),  3700)
    s(() => setStep(4),  5500)
    s(() => setStep(5),  7300)
    // Act 2 — insights (~8–18s)
    s(() => setStep(6),  9000)
    s(() => setStep(7),  12000)
    s(() => setStep(8),  15000)
    // Act 3 — scenario candidates (~18–22s)
    s(() => setStep(9),  18000)
    s(() => setStep(10), 18600)
    s(() => setStep(11), 19200)
    s(() => setStep(12), 19800)
    s(() => setStep(13), 20400)
    // Rejections appear
    s(() => setStep(14), 22500)
    // Act 4 — hide rejected, finalize (~28–30s)
    s(() => setStep(15), 28000)
    s(() => setStep(16), 28800)
    s(() => setStep(17), 29500)
    return clearAll
  }, [])

  // Auto-scroll as content grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [step])

  const isFinal = step >= 17 || step === 99
  const visibleReasoning = step === 99 ? 5 : Math.min(step, 5)
  const visibleInsights  = step === 99 ? 3 : Math.max(0, step - 5)   // step6→1, 7→2, 8→3
  const visibleScenarios = step === 99 ? 5 : Math.max(0, step - 8)   // step9→1 … 13→5
  const showRejections   = step === 99 || step >= 14
  const hideRejected     = step === 99 || step >= 15

  // Opacity cascade: newest line = 1.0, then 0.6, 0.4, 0.25
  const reasoningOpacity = (idx) => {
    const fromEnd = visibleReasoning - 1 - idx
    if (fromEnd === 0) return 1
    if (fromEnd === 1) return 0.6
    if (fromEnd === 2) return 0.4
    return 0.25
  }

  return (
    <div className="w-1/2 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
      {/* Sticky header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <span className="text-sm font-semibold text-gray-900">
          {isFinal ? 'План готов' : 'Анализирую матрицу...'}
        </span>
        {!isFinal && (
          <button
            onClick={jumpToEnd}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Пропустить
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Reasoning stream */}
        {visibleReasoning > 0 && (
          <div className="border-l-2 border-gray-200 pl-4 space-y-2.5">
            {REASONING_LINES.slice(0, visibleReasoning).map((line, idx) => (
              <p
                key={idx}
                className="text-sm text-gray-600 fade-in-up"
                style={{ opacity: reasoningOpacity(idx), transition: 'opacity 0.4s ease' }}
              >
                • {line}
              </p>
            ))}
          </div>
        )}

        {/* Insights */}
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

        {/* Scenario candidates */}
        {visibleScenarios > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Подбираю сценарии</p>
            <div className="space-y-2">
              {SCENARIO_CANDIDATES.slice(0, visibleScenarios).map((sc) => {
                const isRejected = showRejections && sc.rejected
                const isHidden   = hideRejected   && sc.rejected
                return (
                  <div
                    key={sc.id}
                    className="fade-in-up"
                    style={{
                      maxHeight: isHidden ? 0 : '160px',
                      opacity:   isHidden ? 0 : 1,
                      overflow:  'hidden',
                      marginBottom: isHidden ? 0 : undefined,
                      transition: 'max-height 0.4s ease, opacity 0.4s ease, margin 0.4s ease',
                    }}
                  >
                    <div className={`border rounded-lg p-4 ${isRejected ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}`}>
                      <p className={`text-sm font-medium leading-snug ${isRejected ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {sc.name}
                      </p>
                      <p className={`text-xs mt-1 leading-relaxed ${isRejected ? 'line-through text-gray-300' : 'text-gray-500'}`}>
                        {sc.desc}
                      </p>
                      {isRejected && sc.reason && (
                        <p className="text-xs text-red-400 mt-1.5 fade-in-up" style={{ opacity: 0.8 }}>
                          {sc.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer — CTA */}
      <div
        className="flex-shrink-0 p-4 border-t border-gray-100 bg-white"
        style={{
          opacity:   isFinal ? 1 : 0,
          transform: isFinal ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
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

function PlansScreen({ onOpenPlan, onCreatePlan }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans />
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Планы</h1>
          <button
            onClick={onCreatePlan}
            className={`flex items-center gap-2 ${A.bg} ${A.bgHover} text-white text-sm px-4 py-2 rounded-lg transition-colors`}
          >
            <Plus size={15} />
            Создать план
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div
            className="border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
            onClick={onOpenPlan}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 mb-1">Вся матрица Wildberries на 3 месяца (до 24.06.26)</p>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  Стратегия достижения плана строится не вокруг одного рычага, а вокруг последовательной системы автоматизации. В текущих данных видно, что бизнес уже имеет хороший оборот, но часть потенциала теряется на трёх уровнях...
                </p>
              </div>
              <div className="flex gap-8 flex-shrink-0 text-right">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Цель плана</p>
                  <p className="font-bold text-gray-900">1 128 567 343 ₽</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Выполнение плана</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">48%</p>
                    <span className="text-xs bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded">-11%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen({ initialTab, onReport, onAllPlans }) {
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
      <Sidebar highlightPlans />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb + header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          <div className="px-6 pt-3 pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button onClick={onAllPlans} className="hover:text-purple-600 transition-colors">Планы</button>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium truncate max-w-xs">
                  План продаж: Вся матрица Wildberries на 3 месяца (до 24.06.26)
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Активен</span>
                {/* Фича 2 — watching badge */}
                <WatchingBadge />
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

function PlanTab({ expandDesc, setExpandDesc, onReport }) {
  const [editingName, setEditingName] = useState(false)
  const [planName, setPlanName] = useState('Вся матрица Wildberries на 3 месяца (до 24.06.26)')

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
            Стратегия достижения плана строится не вокруг одного рычага, а вокруг последовательной системы автоматизации. В текущих данных видно, что бизнес уже имеет хороший оборот, но часть потенциала теряется на трёх уровнях. Первый — неэффективное привлечение: при CTR 4,75% и рекламной доле расходов 32,1% часть SKU получает дорогой трафик, который можно перераспределить на более конверсионные позиции.
          </p>
          <button onClick={() => setExpandDesc(!expandDesc)} className="mt-1 text-xs text-purple-600 flex items-center gap-1">
            {expandDesc ? <><ChevronUp size={12} />Свернуть</> : <><ChevronDown size={12} />Развернуть</>}
          </button>

          {/* Metrics */}
          <div className="mt-5 grid grid-cols-4 gap-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Цель плана</p>
              <p className="text-lg font-bold text-gray-900">1 128 567 343 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Текущие продажи</p>
              <p className="text-lg font-bold text-gray-900">567 343 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">До выполнения плана</p>
              <p className="text-lg font-bold text-gray-900">754 867 ₽</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Процент выполнения</p>
              <p className="text-lg font-bold text-purple-600">27%</p>
            </div>
          </div>

          {/* Progress + deviation */}
          <div className="mt-5 grid grid-cols-2 gap-5 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">До завершения плана</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">45 дней</p>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-purple-400 rounded-full" style={{ width: '50%' }} />
                <div className="absolute h-4 w-0.5 bg-purple-600 top-1/2 -translate-y-1/2" style={{ left: '50%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span><span>30</span><span>60</span><span>90</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Отклонение от плана</p>
              <p className="text-2xl font-bold text-red-500 mb-2">-11%</p>
              <div className="flex gap-1 h-2">
                <div className="flex-1 bg-red-400 rounded-sm" style={{ maxWidth: '30%' }} title="-4%" />
                <div className="flex-1 bg-green-400 rounded-sm" style={{ maxWidth: '70%' }} title="+27%" />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-red-500">-4%</span>
                <span className="text-green-500">+27%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-900 mb-4">Продажи ₽</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={CHART_DATA} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} tickFormatter={v => v} />
              <YAxis tick={{ fontSize: 11 }} unit=" М" domain={[295, 400]} />
              <Tooltip
                formatter={(v, name) => [v ? `${v} млн ₽` : '—', name]}
                labelFormatter={v => `Точка ${v}`}
              />
              <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="base" name="Динамика до плана" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="plan" name="План" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="fact" name="Факт" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
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

function ReportScreen({ onBack }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar highlightPlans />
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
    { label: 'Все планы', target: 'plans' },
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
      setScreen('plans')
    } else if (target === 'dash-plan') {
      setDashTab('plan')
      setDashKey(k => k + 1)
      setScreen('dashboard')
    } else if (target === 'dash-scenarios') {
      setDashTab('scenarios')
      setDashKey(k => k + 1)
      setScreen('dashboard')
    } else if (target === 'dash-events') {
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
          <StartScreen onStart={(task) => {
            setChatTask(task)
            setChatPreset('start')
            setChatKey(k => k + 1)
            setScreen('chat')
          }} />
        )}
        {screen === 'chat' && (
          <ChatScreen
            key={chatKey}
            initialTask={chatTask}
            preset={chatPreset}
            onPlanReady={() => {
              setDashTab('plan')
              setDashKey(k => k + 1)
              setScreen('dashboard')
            }}
          />
        )}
        {screen === 'plans' && (
          <PlansScreen
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
            onReport={() => setScreen('report')}
            onAllPlans={() => setScreen('plans')}
          />
        )}
        {screen === 'report' && (
          <ReportScreen onBack={() => setScreen('dashboard')} />
        )}
      </div>
      <DemoPanel onJump={jumpTo} />
    </div>
  )
}
