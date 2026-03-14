1. Декомпозиция компонентов => разделяем на умный компонент View и глупые Widgets.
2. Логику из умных компонентов выносим в кастомные хуки. 
3. Синк с бэком 
4. Поиск ошибок/проблем/плохой оптимизации 
5. Устранение магических чисел 
6. Установить Telegram SDK, добавить провайдер, заменить использование внутри проекта самописных методов. 

Проблемы с проектом от Claude:
  ---
Критические

- N+1 запросы: entities/club/ui/club-feed-card.tsx:77-78 — запрос участников клуба вызывается для каждой карточки в ленте
- N+1 запросы: views/account/profile-clubs-section.tsx:81 — аналогичная проблема

Высокие

- FSD-нарушение: entities/club/api.ts:6 — импорт из соседнего слоя entities/event (нарушение горизонтальной зависимости)
- API-вызовы в виджетах: widgets/people-list/index.tsx:31-32, widgets/bottom-nav/index.tsx:28-35 — виджеты не должны делать прямые API-запросы
- as any для Telegram API: shared/lib/telegram.ts:242-250, useTelegramButtons.ts:45,114
- Non-null assertion: views/event-details/index.tsx:551
- Дублирование: PreviewCard дублирован в views/create/index.tsx:153-231 vs shared/components/preview-card.tsx
- Дублирование: DAY_FILTERS в views/home/index.tsx:26-42 vs shared/components/date-filter.tsx:13-29

Средние

- Файлы >1000 строк: views/event-details/index.tsx (1049), views/create/index.tsx (1090)
- 15+ console.log в продакшне: shared/lib/telegram.ts
- Дублирование: appErrorText/ApiError в shared/lib/utils.ts vs shared/components/ui-utils.ts
- Переименование файлов по конвенции (medium из todo.md)
