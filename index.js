// Character Grid
// Copyright (C) 2026 aceenvw (original Ace Character Grid)
// Copyright (C) 2026 howardsierra (chat history, search, and layout additions)
// SPDX-License-Identifier: GPL-3.0-or-later

import {
    deleteCharacter,
    deleteCharacterChatByName,
    doNewChat,
    getPastCharacterChats,
    openCharacterChat,
    renameGroupOrCharacterChat,
    updateRemoteChatName,
} from '../../../../script.js';
import { Popup } from '../../../../scripts/popup.js';
import { renderTemplateAsync } from '../../../../scripts/templates.js';

const MODULE_NAME = 'character-grid';
const EXTENSION_NAME = String(import.meta.url).match(/\/scripts\/extensions\/(.+)\/[^/]+$/)?.[1]
    || MODULE_NAME;
const ROOT_ID = 'character-grid-root';
const SETTINGS_CLASS = 'character-grid-settings';
const SETTINGS_ANCHOR = '.ace-entry-track-settings';
const BODY_CLASS = 'cg-active';
const TAG = 'CG';

const DEFAULT_SETTINGS = Object.freeze({
    pageSize: 48,
    gridColumns: '6',
    cardTheme: 'dark',
    customGradient: '#08090b',
    customText: '#f5f5f6',
    sortMode: 'recent',
    showToolbar: true,
    showLastChat: false,
    touchHintShown: false,
});

const PAGE_SIZE_VALUES = new Set([24, 48, 96]);
const GRID_COLUMN_VALUES = new Set(['auto', '3', '4', '5', '6', '7', '8', '9', '10']);
const CARD_THEME_VALUES = new Set(['dark', 'light', 'custom']);
const SORT_MODE_VALUES = new Set(['recent', 'name', 'favourites']);
const BOOLEAN_SETTINGS = ['showToolbar', 'showLastChat', 'touchHintShown'];
const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;
const SHEET_QUERY = '(max-width: 640px)';
const CHAT_SEARCH_THRESHOLD = 6;
const PANEL_TRANSITION_MS = 240;
const LONG_PRESS_MS = 420;

const STRINGS = {
    en: {
        title: 'Character Grid',
        favourite: 'Favourite',
        open: 'Open chat with {name}',
        delete: 'Delete',
        chats: 'Chats',
        chatsFor: 'Chats with {name}',
        deleteTitle: 'Delete the character?',
        previous: 'Previous',
        next: 'Next',
        page: 'Page {page} of {pages}',
        empty: 'No characters yet',
        emptyHint: 'Import a character in SillyTavern to see it here.',
        noMatches: 'No characters match “{query}”',
        noMatchesHint: 'Try a different name, or clear the search.',
        clearSearch: 'Clear search',
        searchCharacters: 'Search characters',
        sortBy: 'Sort characters',
        sortRecent: 'Recent',
        sortName: 'A–Z',
        sortFavourites: 'Favourites',
        untitled: 'Untitled character',
        openError: 'Could not open this character.',
        deleteError: 'Could not delete this character.',
        missing: 'This character is no longer available.',
        close: 'Close',
        continue: 'Continue',
        newChat: 'New chat',
        deleteCharacter: 'Delete character',
        searchChats: 'Search chats',
        loadingChats: 'Loading chats…',
        noChats: 'No chats yet',
        noChatsHint: 'Start one and it will appear here.',
        noChatMatches: 'No chats match “{query}”',
        chatsError: 'Could not load chats.',
        retry: 'Try again',
        current: 'Current',
        chatCount_one: '{count} chat',
        chatCount_other: '{count} chats',
        messageCount_one: '{count} message',
        messageCount_other: '{count} messages',
        lastChat: 'Last chat {time}',
        never: 'No chats yet',
        renameChat: 'Rename chat',
        renamePrompt: 'Enter a new name for this chat.',
        deleteChat: 'Delete chat',
        deleteChatTitle: 'Delete this chat?',
        deleteChatText: '“{name}” will be permanently deleted.',
        chatOpenError: 'Could not open this chat.',
        chatDeleteError: 'Could not delete this chat.',
        chatRenameError: 'Could not rename this chat.',
        touchHint: 'Press and hold a portrait to see its chats.',
    },
    ru: {
        title: 'Сетка персонажей',
        favourite: 'Избранное',
        open: 'Открыть чат с персонажем {name}',
        delete: 'Удалить',
        chats: 'Чаты',
        chatsFor: 'Чаты с персонажем {name}',
        deleteTitle: 'Удалить персонажа?',
        previous: 'Назад',
        next: 'Вперёд',
        page: 'Страница {page} из {pages}',
        empty: 'Персонажей пока нет',
        emptyHint: 'Импортируйте персонажа в SillyTavern, чтобы увидеть его здесь.',
        noMatches: 'Нет персонажей по запросу «{query}»',
        noMatchesHint: 'Попробуйте другое имя или очистите поиск.',
        clearSearch: 'Очистить поиск',
        searchCharacters: 'Поиск персонажей',
        sortBy: 'Сортировка персонажей',
        sortRecent: 'Недавние',
        sortName: 'А–Я',
        sortFavourites: 'Избранные',
        untitled: 'Безымянный персонаж',
        openError: 'Не удалось открыть этого персонажа.',
        deleteError: 'Не удалось удалить этого персонажа.',
        missing: 'Этот персонаж больше недоступен.',
        close: 'Закрыть',
        continue: 'Продолжить',
        newChat: 'Новый чат',
        deleteCharacter: 'Удалить персонажа',
        searchChats: 'Поиск чатов',
        loadingChats: 'Загрузка чатов…',
        noChats: 'Чатов пока нет',
        noChatsHint: 'Начните новый, и он появится здесь.',
        noChatMatches: 'Нет чатов по запросу «{query}»',
        chatsError: 'Не удалось загрузить чаты.',
        retry: 'Повторить',
        current: 'Текущий',
        chatCount_one: '{count} чат',
        chatCount_few: '{count} чата',
        chatCount_many: '{count} чатов',
        chatCount_other: '{count} чата',
        messageCount_one: '{count} сообщение',
        messageCount_few: '{count} сообщения',
        messageCount_many: '{count} сообщений',
        messageCount_other: '{count} сообщения',
        lastChat: 'Последний чат {time}',
        never: 'Чатов пока нет',
        renameChat: 'Переименовать чат',
        renamePrompt: 'Введите новое название чата.',
        deleteChat: 'Удалить чат',
        deleteChatTitle: 'Удалить этот чат?',
        deleteChatText: '«{name}» будет удалён без возможности восстановления.',
        chatOpenError: 'Не удалось открыть этот чат.',
        chatDeleteError: 'Не удалось удалить этот чат.',
        chatRenameError: 'Не удалось переименовать этот чат.',
        touchHint: 'Нажмите и удерживайте портрет, чтобы увидеть его чаты.',
    },
};

const HASH_DELTAS = Uint8Array.of(2, 2, 0, 9, 8, 1);
const HASH_SEED = HASH_DELTAS.reduce(
    (hash, value) => Math.imul(hash ^ value, 16777619) >>> 0,
    2166136261,
);

const state = {
    context: null,
    settings: null,
    root: null,
    settingsRoot: null,
    records: null,
    recordByAvatar: new Map(),
    chatCache: new Map(),
    listeners: [],
    domListeners: [],
    busyAvatars: new Set(),
    query: '',
    page: 1,
    renderFrame: 0,
    pressTimer: 0,
    pressStartX: 0,
    pressStartY: 0,
    pressActive: false,
    pressRevealed: false,
    suppressClickUntil: 0,
    holdOpen: false,
    settingsKey: '',
    uiLanguage: '',
    lifecycle: 0,
    ready: false,
    panel: {
        layer: null,
        record: null,
        chats: null,
        status: 'idle',
        filter: '',
        requestId: 0,
        closeTimer: 0,
        busy: false,
        returnFocus: null,
        drag: null,
    },
};

const warn = (step, error) => console.warn(`[${TAG}] ${step}`, error);

function refreshContext() {
    state.context = SillyTavern.getContext();
    return state.context;
}

function getLanguage() {
    const locale = state.context?.getCurrentLocale?.() || 'en';
    return String(locale).toLowerCase().split(/[-_]/)[0] === 'ru' ? 'ru' : 'en';
}

function text(key, values = {}) {
    const value = STRINGS[getLanguage()]?.[key] ?? STRINGS.en[key] ?? key;
    return value.replace(/\{(\w+)\}/g, (match, name) => (
        Object.hasOwn(values, name) ? String(values[name]) : match
    ));
}

function plural(key, count) {
    const language = getLanguage();
    const rule = new Intl.PluralRules(language).select(count);
    const strings = STRINGS[language];
    const resolved = strings[`${key}_${rule}`] ? `${key}_${rule}` : `${key}_other`;
    return text(resolved, { count: count.toLocaleString(language) });
}

const RELATIVE_UNITS = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
];

function formatRelative(timestamp) {
    if (!timestamp) return '';
    const elapsed = timestamp - Date.now();
    const formatter = new Intl.RelativeTimeFormat(getLanguage(), { numeric: 'auto', style: 'short' });
    for (const [unit, size] of RELATIVE_UNITS) {
        if (Math.abs(elapsed) >= size || unit === 'minute') {
            return formatter.format(Math.round(elapsed / size), unit);
        }
    }
    return '';
}

function formatAbsolute(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString(getLanguage(), { dateStyle: 'medium', timeStyle: 'short' });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
    })[character]);
}

function foldText(value) {
    return String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

function loadSettings() {
    const context = refreshContext();
    const stored = context.extensionSettings[MODULE_NAME];

    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
        context.extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }

    state.settings = context.extensionSettings[MODULE_NAME];
    if (!PAGE_SIZE_VALUES.has(Number(state.settings.pageSize))) {
        state.settings.pageSize = DEFAULT_SETTINGS.pageSize;
    } else {
        state.settings.pageSize = Number(state.settings.pageSize);
    }
    if (!GRID_COLUMN_VALUES.has(String(state.settings.gridColumns))) {
        state.settings.gridColumns = DEFAULT_SETTINGS.gridColumns;
    } else {
        state.settings.gridColumns = String(state.settings.gridColumns);
    }
    if (!CARD_THEME_VALUES.has(String(state.settings.cardTheme))) {
        state.settings.cardTheme = DEFAULT_SETTINGS.cardTheme;
    } else {
        state.settings.cardTheme = String(state.settings.cardTheme);
    }
    if (!SORT_MODE_VALUES.has(String(state.settings.sortMode))) {
        state.settings.sortMode = DEFAULT_SETTINGS.sortMode;
    }
    for (const key of ['customGradient', 'customText']) {
        const value = String(state.settings[key] ?? '');
        state.settings[key] = HEX_COLOR_PATTERN.test(value)
            ? value.toLowerCase()
            : DEFAULT_SETTINGS[key];
    }
    for (const key of BOOLEAN_SETTINGS) {
        state.settings[key] = typeof state.settings[key] === 'boolean'
            ? state.settings[key]
            : DEFAULT_SETTINGS[key];
    }
}

function getSettingsKey() {
    return [
        state.settings.pageSize,
        state.settings.gridColumns,
        state.settings.cardTheme,
        state.settings.customGradient,
        state.settings.customText,
        state.settings.sortMode,
        state.settings.showToolbar,
        state.settings.showLastChat,
    ].join(':');
}

function saveSettings() {
    state.settingsKey = getSettingsKey();
    state.context.saveSettingsDebounced();
}

function stableId(value) {
    let hash = HASH_SEED;
    for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
    }
    return `cg-name-${hash.toString(36)}`;
}

function isFavourite(character) {
    const value = character?.data?.extensions?.fav ?? character?.fav;
    return value === true || value === 'true' || value === 1;
}

function toTimestamp(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value) return 0;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    try {
        // SillyTavern stores several legacy date formats; its parser knows them all.
        const moment = state.context?.timestampToMoment?.(value);
        if (moment?.isValid?.()) return moment.valueOf();
    } catch (error) {
        warn('timestamp', error);
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeCharacters() {
    const context = refreshContext();
    const records = (Array.isArray(context.characters) ? context.characters : [])
        .map((character, sourceIndex) => {
            const avatarKey = typeof character?.avatar === 'string' ? character.avatar.trim() : '';
            if (!avatarKey) return null;

            let avatarUrl = '';
            try {
                avatarUrl = context.getThumbnailUrl('avatar', avatarKey);
            } catch (error) {
                warn('thumbnail', error);
            }

            const name = typeof character?.name === 'string' && character.name.trim()
                ? character.name.trim()
                : text('untitled');
            return {
                avatarKey,
                avatarUrl,
                favourite: isFavourite(character),
                name,
                searchName: foldText(name),
                dateLastChat: toTimestamp(character?.date_last_chat),
                sourceIndex,
            };
        })
        .filter(Boolean);

    state.recordByAvatar = new Map(records.map((record) => [record.avatarKey, record]));
    return records;
}

function getRecords() {
    state.records ??= normalizeCharacters();
    return state.records;
}

const SORTERS = {
    recent: (left, right) => (
        right.dateLastChat - left.dateLastChat || left.sourceIndex - right.sourceIndex
    ),
    name: (left, right) => (
        left.name.localeCompare(right.name, getLanguage(), { sensitivity: 'base', numeric: true })
        || left.sourceIndex - right.sourceIndex
    ),
    favourites: (left, right) => (
        Number(right.favourite) - Number(left.favourite) || SORTERS.recent(left, right)
    ),
};

function getVisibleRecords() {
    const query = foldText(state.query.trim());
    const records = query
        ? getRecords().filter((record) => record.searchName.includes(query))
        : getRecords().slice();
    return records.sort(SORTERS[state.settings.sortMode] ?? SORTERS.recent);
}

function getPageData() {
    const records = getVisibleRecords();
    const pageSize = Number(state.settings.pageSize);
    const pages = Math.max(1, Math.ceil(records.length / pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    const start = (state.page - 1) * pageSize;
    return { items: records.slice(start, start + pageSize), pages, total: records.length };
}

function createIcon(className) {
    const icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

function createButton(action, className, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    if (className) button.className = className;
    if (label) {
        button.setAttribute('aria-label', label);
        button.title = label;
    }
    return button;
}

function createImage(record) {
    const frame = document.createElement('span');
    frame.className = 'acg-card__image-frame';

    const fallback = document.createElement('span');
    fallback.className = 'acg-card__fallback';
    fallback.append(createIcon('fa-solid fa-user'));
    frame.append(fallback);

    if (!record.avatarUrl) return frame;

    const image = document.createElement('img');
    image.className = 'acg-card__image';
    image.src = record.avatarUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => image.remove(), { once: true });
    frame.append(image);
    return frame;
}

function createCard(record) {
    const article = document.createElement('article');
    article.className = 'acg-card';

    const nameId = stableId(record.avatarKey);
    const busy = state.busyAvatars.has(record.avatarKey);
    const open = createButton('open', 'acg-card__open');
    open.dataset.avatar = record.avatarKey;
    const openLabel = text('open', { name: record.name });
    open.setAttribute('aria-label', record.favourite
        ? `${openLabel}. ${text('favourite')}`
        : openLabel);
    open.title = record.name;
    open.disabled = busy;

    const plate = createElement('span', 'acg-card__plate');
    const name = createElement('span', 'acg-card__name');
    name.id = nameId;

    if (record.favourite) {
        const favourite = createElement('span', 'acg-card__favourite');
        favourite.setAttribute('aria-hidden', 'true');
        favourite.append(createIcon('fa-solid fa-star'));
        name.append(favourite);
    }

    name.append(createElement('span', 'acg-card__name-text', record.name));
    plate.append(name);

    if (state.settings.showLastChat) {
        const meta = createElement('span', 'acg-card__meta', record.dateLastChat
            ? formatRelative(record.dateLastChat)
            : text('never'));
        plate.append(meta);
    }

    const image = createImage(record);
    image.append(plate);
    open.append(image);

    const actions = createElement('span', 'acg-card__actions');

    const history = createButton('history', 'acg-card__action', text('chats'));
    history.dataset.avatar = record.avatarKey;
    history.setAttribute('aria-describedby', nameId);
    history.setAttribute('aria-haspopup', 'dialog');
    history.disabled = busy;
    history.append(createIcon('fa-solid fa-clock-rotate-left'));

    const remove = createButton('delete', 'acg-card__action acg-card__action--danger', text('delete'));
    remove.dataset.avatar = record.avatarKey;
    remove.setAttribute('aria-describedby', nameId);
    remove.disabled = busy;
    remove.append(createIcon('fa-solid fa-trash-can'));

    actions.append(history, remove);
    article.append(open, actions);
    return article;
}

function createPager(pages) {
    const pager = document.createElement('nav');
    pager.className = 'acg-pager';
    pager.setAttribute('aria-label', text('page', { page: state.page, pages }));

    const previous = createButton('previous');
    previous.disabled = state.page === 1;
    previous.append(createIcon('fa-solid fa-arrow-left'), document.createTextNode(text('previous')));

    const label = createElement('span', 'acg-pager__label', text('page', { page: state.page, pages }));

    const next = createButton('next');
    next.disabled = state.page === pages;
    next.append(document.createTextNode(text('next')), createIcon('fa-solid fa-arrow-right'));

    pager.append(previous, label, next);
    return pager;
}

function createToolbar() {
    const toolbar = createElement('div', 'acg-toolbar');

    const search = createElement('label', 'acg-search');
    search.append(createIcon('fa-solid fa-magnifying-glass acg-search__icon'));
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'acg-search__input';
    input.dataset.role = 'character-search';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.enterKeyHint = 'search';
    input.addEventListener('input', handleCharacterSearch);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && input.value) {
            event.stopPropagation();
            setCharacterQuery('');
        }
    });
    const clear = createButton('clear-search', 'acg-search__clear');
    clear.hidden = true;
    clear.append(createIcon('fa-solid fa-xmark'));
    search.append(input, clear);

    const sort = createElement('label', 'acg-sort');
    sort.append(createIcon('fa-solid fa-arrow-down-wide-short acg-sort__icon'));
    const select = document.createElement('select');
    select.className = 'acg-sort__select';
    select.dataset.role = 'character-sort';
    select.addEventListener('change', () => {
        if (!SORT_MODE_VALUES.has(select.value)) return;
        state.settings.sortMode = select.value;
        state.page = 1;
        saveSettings();
        renderGallery();
    });
    sort.append(select);

    toolbar.append(search, sort);
    return toolbar;
}

function syncToolbar() {
    const toolbar = state.root?.querySelector('.acg-toolbar');
    if (!(toolbar instanceof HTMLElement)) return;
    toolbar.hidden = !state.settings.showToolbar;

    const input = toolbar.querySelector('[data-role="character-search"]');
    if (input instanceof HTMLInputElement) {
        input.placeholder = text('searchCharacters');
        input.setAttribute('aria-label', text('searchCharacters'));
        if (input.value !== state.query) input.value = state.query;
    }
    const clear = toolbar.querySelector('[data-action="clear-search"]');
    if (clear instanceof HTMLButtonElement) {
        clear.hidden = !state.query;
        clear.setAttribute('aria-label', text('clearSearch'));
        clear.title = text('clearSearch');
    }
    const select = toolbar.querySelector('[data-role="character-sort"]');
    if (select instanceof HTMLSelectElement) {
        select.setAttribute('aria-label', text('sortBy'));
        const options = [
            ['recent', text('sortRecent')],
            ['name', text('sortName')],
            ['favourites', text('sortFavourites')],
        ];
        if (select.options.length !== options.length || select.dataset.language !== getLanguage()) {
            select.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
            select.dataset.language = getLanguage();
        }
        select.value = state.settings.sortMode;
    }
}

function setCharacterQuery(value) {
    if (state.query === value) return;
    state.query = value;
    state.page = 1;
    renderGallery();
}

function handleCharacterSearch(event) {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) setCharacterQuery(input.value);
}

function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!(root instanceof HTMLElement)) {
        root = document.createElement('section');
        root.id = ROOT_ID;
        root.hidden = true;
        root.setAttribute('aria-label', text('title'));
        root.addEventListener('click', handleClickCapture, true);
        root.addEventListener('click', handleRootClick);
        root.addEventListener('pointerdown', handlePointerDown);
        root.addEventListener('pointermove', handlePointerMove);
        root.addEventListener('pointerup', handlePointerEnd);
        root.addEventListener('pointercancel', handlePointerEnd);
        root.addEventListener('contextmenu', handleCardContextMenu);

        const heading = createElement('h1', 'acg-visually-hidden', text('title'));

        const shell = createElement('div', 'acg-shell');
        const region = createElement('main', 'acg-results');
        shell.append(createToolbar(), region);

        const status = createElement('p', 'acg-status acg-visually-hidden');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');

        root.append(heading, shell, status, createPanelLayer());
        document.body.append(root);
    }
    state.root = root;
    state.panel.layer = root.querySelector('.acg-panel-layer');
    applyDisplayPreferences();
    return root;
}

function applyDisplayPreferences() {
    if (state.root && state.settings) {
        state.root.dataset.columns = state.settings.gridColumns;
        state.root.dataset.cardTheme = state.settings.cardTheme;
        state.root.style.setProperty('--acg-custom-gradient', state.settings.customGradient);
        state.root.style.setProperty('--acg-custom-text', state.settings.customText);
        syncToolbar();
    }
}

function renderGallery() {
    const root = ensureRoot();
    const region = root.querySelector('.acg-results');
    if (!(region instanceof HTMLElement)) return;

    root.setAttribute('aria-label', text('title'));
    const heading = root.querySelector('h1');
    if (heading) heading.textContent = text('title');
    syncToolbar();

    const { items, pages, total } = getPageData();
    const fragment = document.createDocumentFragment();

    if (items.length) {
        const grid = createElement('div', 'acg-grid');
        items.forEach((record) => grid.append(createCard(record)));
        fragment.append(grid);
    } else if (state.query.trim() && getRecords().length) {
        const clear = createButton('clear-search', 'acg-empty__action');
        clear.textContent = text('clearSearch');
        fragment.append(createEmptyState(
            'fa-solid fa-magnifying-glass',
            text('noMatches', { query: state.query.trim() }),
            text('noMatchesHint'),
            clear,
        ));
    } else {
        fragment.append(createEmptyState('fa-solid fa-address-card', text('empty'), text('emptyHint')));
    }

    if (total > Number(state.settings.pageSize)) {
        fragment.append(createPager(pages));
    }
    region.replaceChildren(fragment);
    state.uiLanguage = getLanguage();
    if (state.panel.record) renderPanel();
}

function createEmptyState(iconClass, titleText, hintText, action) {
    const empty = createElement('div', 'acg-empty');
    empty.append(
        createIcon(iconClass),
        createElement('strong', '', titleText),
        createElement('span', '', hintText),
    );
    if (action) empty.append(action);
    return empty;
}

function announce(message) {
    const status = state.root?.querySelector('.acg-status');
    if (status) status.textContent = message;
}

function showError(key, error) {
    warn(key, error);
    const message = text(key);
    announce(message);
    globalThis.toastr?.error?.(message, text('title'));
}

function showNotice(key) {
    const message = text(key);
    announce(message);
    globalThis.toastr?.warning?.(message, text('title'));
}

function findCurrentCharacter(avatarKey) {
    const context = refreshContext();
    const characters = Array.isArray(context.characters) ? context.characters : [];
    return characters.findIndex((character) => character?.avatar === avatarKey);
}

function setButtonBusy(button, busy) {
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = busy;
    if (busy) button.setAttribute('aria-busy', 'true');
    else button.removeAttribute('aria-busy');
}

/**
 * Selects a character and, optionally, switches to a specific chat or a new one.
 * The grid stays on screen until the final chat is ready, so the intermediate
 * chat SillyTavern loads first never flashes into view.
 */
async function enterCharacter(record, button, { chatId = null, newChat = false } = {}) {
    const lifecycle = state.lifecycle;
    const index = findCurrentCharacter(record.avatarKey);
    if (index < 0) {
        invalidateRecords();
        closePanel();
        showNotice('missing');
        return;
    }

    const usesPanel = state.panel.record?.avatarKey === record.avatarKey;
    setButtonBusy(button, true);
    if (usesPanel) setPanelBusy(true);
    state.holdOpen = Boolean(chatId || newChat);
    let entered = false;
    try {
        await state.context.selectCharacterById(index, { switchMenu: false });
        if (!state.ready || state.lifecycle !== lifecycle) return;
        const selected = String(refreshContext().characterId) === String(index);
        if (selected && newChat) {
            await doNewChat();
        } else if (selected && chatId && state.context.getCurrentChatId?.() !== chatId) {
            await openCharacterChat(chatId);
        }
        entered = selected;
    } catch (error) {
        showError(chatId || newChat ? 'chatOpenError' : 'openError', error);
    } finally {
        state.holdOpen = false;
        if (button.isConnected) setButtonBusy(button, false);
        if (usesPanel) setPanelBusy(false);
        if (state.ready && state.lifecycle === lifecycle) {
            if (entered) closePanel({ immediate: true, restoreFocus: false });
            updateVisibility();
        }
    }
}

async function confirmDelete(record, button) {
    if (state.busyAvatars.has(record.avatarKey)) return false;
    const lifecycle = state.lifecycle;
    state.busyAvatars.add(record.avatarKey);
    setButtonBusy(button, true);

    let deleteChats = false;
    let refresh = false;
    let deleted = false;
    try {
        const content = await renderTemplateAsync('deleteConfirm');
        if (!state.ready || state.lifecycle !== lifecycle) return false;
        const confirmed = await Popup.show.confirm(text('deleteTitle'), content, {
            onClose: () => {
                deleteChats = Boolean(document.getElementById('del_char_checkbox')?.checked);
            },
        });
        if (!confirmed || !state.ready || state.lifecycle !== lifecycle) return false;

        if (findCurrentCharacter(record.avatarKey) < 0) {
            refresh = true;
            showNotice('missing');
            return true;
        }

        refresh = true;
        await deleteCharacter(record.avatarKey, { deleteChats });
        deleted = true;
    } catch (error) {
        showError('deleteError', error);
    } finally {
        state.busyAvatars.delete(record.avatarKey);
        if (refresh) {
            state.chatCache.delete(record.avatarKey);
            invalidateRecords();
        } else if (button.isConnected) {
            setButtonBusy(button, false);
        }
    }
    return deleted || refresh;
}

function changePage(direction) {
    state.page += direction;
    renderGallery();
    state.root?.scrollTo({ top: 0, behavior: 'instant' });
}

/* ---------- Chat history panel ---------- */

function createPanelLayer() {
    const layer = createElement('div', 'acg-panel-layer');
    layer.hidden = true;
    layer.dataset.state = 'closed';

    const backdrop = createElement('div', 'acg-panel-backdrop');
    backdrop.dataset.action = 'close-panel';

    const panel = createElement('aside', 'acg-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'cg-panel-title');
    panel.tabIndex = -1;
    panel.addEventListener('keydown', handlePanelKeydown);

    const grabber = createElement('div', 'acg-panel__grabber');
    grabber.setAttribute('aria-hidden', 'true');

    const header = createElement('header', 'acg-panel__header');
    header.addEventListener('pointerdown', handleSheetDragStart);
    header.append(grabber);
    const avatar = createElement('span', 'acg-panel__avatar');
    const heading = createElement('div', 'acg-panel__heading');
    const title = createElement('h2', 'acg-panel__title');
    title.id = 'cg-panel-title';
    const subtitle = createElement('p', 'acg-panel__subtitle');
    heading.append(title, subtitle);
    const close = createButton('close-panel', 'acg-icon-button acg-panel__close');
    close.append(createIcon('fa-solid fa-xmark'));
    header.append(avatar, heading, close);

    const actions = createElement('div', 'acg-panel__actions');
    const resume = createButton('continue', 'acg-button acg-button--primary');
    const fresh = createButton('new-chat', 'acg-button');
    const remove = createButton('delete-character', 'acg-icon-button acg-icon-button--danger');
    remove.append(createIcon('fa-solid fa-trash-can'));
    actions.append(resume, fresh, remove);

    const search = createElement('label', 'acg-search acg-panel__search');
    search.hidden = true;
    search.append(createIcon('fa-solid fa-magnifying-glass acg-search__icon'));
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'acg-search__input';
    input.dataset.role = 'chat-search';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.addEventListener('input', () => {
        state.panel.filter = input.value;
        renderChatList();
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && input.value) {
            event.stopPropagation();
            input.value = '';
            state.panel.filter = '';
            renderChatList();
        }
    });
    search.append(input);

    const body = createElement('div', 'acg-panel__body');
    const list = createElement('ul', 'acg-chat-list');
    body.append(list);

    panel.append(header, actions, search, body);
    layer.append(backdrop, panel);
    return layer;
}

function isSheetLayout() {
    return window.matchMedia(SHEET_QUERY).matches;
}

function getPanelParts() {
    const layer = state.panel.layer;
    if (!(layer instanceof HTMLElement)) return null;
    return {
        layer,
        panel: layer.querySelector('.acg-panel'),
        avatar: layer.querySelector('.acg-panel__avatar'),
        title: layer.querySelector('.acg-panel__title'),
        subtitle: layer.querySelector('.acg-panel__subtitle'),
        close: layer.querySelector('.acg-panel__close'),
        resume: layer.querySelector('[data-action="continue"]'),
        fresh: layer.querySelector('[data-action="new-chat"]'),
        remove: layer.querySelector('[data-action="delete-character"]'),
        search: layer.querySelector('.acg-panel__search'),
        input: layer.querySelector('[data-role="chat-search"]'),
        list: layer.querySelector('.acg-chat-list'),
    };
}

function openPanel(record, trigger) {
    const parts = getPanelParts();
    if (!parts) return;
    window.clearTimeout(state.panel.closeTimer);

    const alreadyOpen = !parts.layer.hidden && state.panel.record?.avatarKey === record.avatarKey;
    if (alreadyOpen && parts.layer.dataset.state === 'open') return;

    if (!alreadyOpen) {
        state.panel.record = record;
        state.panel.filter = '';
        state.panel.chats = state.chatCache.get(record.avatarKey) ?? null;
        state.panel.status = state.panel.chats ? 'ready' : 'loading';
        if (parts.input instanceof HTMLInputElement) parts.input.value = '';
        state.panel.returnFocus = trigger instanceof HTMLElement ? trigger : null;
    }

    renderPanel();
    parts.layer.hidden = false;
    parts.panel.style.removeProperty('transform');
    state.root?.classList.add('acg-panel-open');
    state.root?.querySelector('.acg-shell')?.setAttribute('inert', '');
    // Let the closed state paint first so the slide-in transition runs.
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            if (state.panel.record !== record) return;
            parts.layer.dataset.state = 'open';
            const focusTarget = isSheetLayout() ? parts.panel : parts.resume;
            focusTarget?.focus({ preventScroll: true });
        });
    });

    void loadChats(record);
}

function closePanel({ immediate = false, restoreFocus = true } = {}) {
    const parts = getPanelParts();
    if (!parts || parts.layer.hidden) {
        state.panel.record = null;
        return;
    }
    const returnFocus = state.panel.returnFocus;
    state.panel.requestId += 1;
    state.panel.record = null;
    state.panel.returnFocus = null;
    state.panel.drag = null;
    parts.layer.dataset.state = 'closed';
    parts.panel.style.removeProperty('transform');
    parts.panel.style.removeProperty('transition');
    state.root?.classList.remove('acg-panel-open');
    state.root?.querySelector('.acg-shell')?.removeAttribute('inert');

    const finish = () => {
        if (state.panel.record) return;
        parts.layer.hidden = true;
    };
    window.clearTimeout(state.panel.closeTimer);
    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else state.panel.closeTimer = window.setTimeout(finish, PANEL_TRANSITION_MS);

    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}

function setPanelBusy(busy) {
    state.panel.busy = busy;
    const parts = getPanelParts();
    parts?.panel?.toggleAttribute('aria-busy', busy);
    parts?.panel?.querySelectorAll('.acg-panel__actions button, .acg-chat button').forEach((button) => {
        button.disabled = busy;
    });
}

function normalizeChat(chat) {
    if (!chat || typeof chat !== 'object' || typeof chat.file_name !== 'string') return null;
    const id = typeof chat.file_id === 'string' && chat.file_id
        ? chat.file_id
        : chat.file_name.replace(/\.jsonl$/i, '');
    const preview = String(chat.mes ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 240);
    return {
        id,
        searchText: foldText(`${id} ${preview}`),
        preview,
        messages: Math.max(0, Number(chat.chat_items) || 0),
        timestamp: toTimestamp(chat.last_mes),
    };
}

async function loadChats(record) {
    const requestId = ++state.panel.requestId;
    const index = findCurrentCharacter(record.avatarKey);
    if (index < 0) {
        closePanel();
        invalidateRecords();
        showNotice('missing');
        return;
    }

    try {
        const response = await getPastCharacterChats(index);
        if (requestId !== state.panel.requestId || state.panel.record?.avatarKey !== record.avatarKey) return;
        const chats = (Array.isArray(response) ? response : [])
            .map(normalizeChat)
            .filter(Boolean)
            .sort((left, right) => right.timestamp - left.timestamp || left.id.localeCompare(right.id));
        state.chatCache.set(record.avatarKey, chats);
        state.panel.chats = chats;
        state.panel.status = 'ready';
    } catch (error) {
        if (requestId !== state.panel.requestId) return;
        warn('chats', error);
        if (!state.panel.chats) state.panel.status = 'error';
    }
    renderPanel();
}

function getCurrentChatName(record) {
    const index = findCurrentCharacter(record.avatarKey);
    const chat = index >= 0 ? state.context.characters[index]?.chat : '';
    return typeof chat === 'string' ? chat : '';
}

function renderPanel() {
    const parts = getPanelParts();
    const record = state.panel.record;
    if (!parts || !record) return;

    const fresh = state.recordByAvatar.get(record.avatarKey);
    if (state.records && !fresh) {
        closePanel({ restoreFocus: false });
        return;
    }
    if (fresh && fresh !== record) state.panel.record = fresh;
    const current = state.panel.record;

    parts.panel.setAttribute('aria-label', text('chatsFor', { name: current.name }));
    parts.title.textContent = current.name;
    const chats = state.panel.chats;
    parts.subtitle.textContent = chats
        ? plural('chatCount', chats.length)
        : text('loadingChats');

    const avatarImage = parts.avatar.querySelector('img');
    if (current.avatarUrl && avatarImage?.getAttribute('src') !== current.avatarUrl) {
        const image = document.createElement('img');
        image.src = current.avatarUrl;
        image.alt = '';
        image.decoding = 'async';
        image.addEventListener('error', () => image.remove(), { once: true });
        parts.avatar.replaceChildren(image);
    } else if (!current.avatarUrl) {
        parts.avatar.replaceChildren(createIcon('fa-solid fa-user'));
    }

    parts.close.setAttribute('aria-label', text('close'));
    parts.close.title = text('close');
    parts.resume.replaceChildren(createIcon('fa-solid fa-play'), document.createTextNode(text('continue')));
    parts.fresh.replaceChildren(createIcon('fa-solid fa-plus'), document.createTextNode(text('newChat')));
    parts.remove.setAttribute('aria-label', text('deleteCharacter'));
    parts.remove.title = text('deleteCharacter');

    const showSearch = Boolean(chats && chats.length >= CHAT_SEARCH_THRESHOLD);
    parts.search.hidden = !showSearch;
    parts.input.placeholder = text('searchChats');
    parts.input.setAttribute('aria-label', text('searchChats'));
    if (!showSearch && state.panel.filter) {
        state.panel.filter = '';
        parts.input.value = '';
    }

    renderChatList();
    setPanelBusy(state.panel.busy);
}

function renderChatList() {
    const parts = getPanelParts();
    const record = state.panel.record;
    if (!parts || !record) return;
    const { list } = parts;
    list.removeAttribute('aria-busy');

    if (state.panel.status === 'loading' && !state.panel.chats) {
        list.setAttribute('aria-busy', 'true');
        const rows = Array.from({ length: 4 }, () => {
            const row = createElement('li', 'acg-chat acg-chat--skeleton');
            row.setAttribute('aria-hidden', 'true');
            row.append(
                createElement('span', 'acg-skeleton acg-skeleton--title'),
                createElement('span', 'acg-skeleton acg-skeleton--line'),
                createElement('span', 'acg-skeleton acg-skeleton--meta'),
            );
            return row;
        });
        list.replaceChildren(...rows);
        return;
    }

    if (state.panel.status === 'error') {
        const retry = createButton('retry-chats', 'acg-button');
        retry.textContent = text('retry');
        list.replaceChildren(createListMessage('fa-solid fa-triangle-exclamation', text('chatsError'), '', retry));
        return;
    }

    const chats = state.panel.chats ?? [];
    if (!chats.length) {
        list.replaceChildren(createListMessage('fa-regular fa-comments', text('noChats'), text('noChatsHint')));
        return;
    }

    const query = foldText(state.panel.filter.trim());
    const visible = query ? chats.filter((chat) => chat.searchText.includes(query)) : chats;
    if (!visible.length) {
        list.replaceChildren(createListMessage(
            'fa-solid fa-magnifying-glass',
            text('noChatMatches', { query: state.panel.filter.trim() }),
            '',
        ));
        return;
    }

    const currentChat = getCurrentChatName(record);
    list.replaceChildren(...visible.map((chat) => createChatRow(chat, chat.id === currentChat)));
}

function createListMessage(iconClass, titleText, hintText, action) {
    const item = createElement('li', 'acg-chat-list__message');
    item.append(createIcon(iconClass), createElement('strong', '', titleText));
    if (hintText) item.append(createElement('span', '', hintText));
    if (action) item.append(action);
    return item;
}

function createChatRow(chat, isCurrent) {
    const row = createElement('li', 'acg-chat');
    if (isCurrent) row.classList.add('acg-chat--current');

    const open = createButton('open-chat', 'acg-chat__open');
    open.dataset.chat = chat.id;

    const title = createElement('span', 'acg-chat__title');
    title.append(createElement('span', 'acg-chat__name', chat.id));
    if (isCurrent) title.append(createElement('span', 'acg-chat__badge', text('current')));

    const preview = createElement('span', 'acg-chat__preview', chat.preview);

    const meta = createElement('span', 'acg-chat__meta');
    const time = document.createElement('time');
    if (chat.timestamp) {
        time.dateTime = new Date(chat.timestamp).toISOString();
        time.title = formatAbsolute(chat.timestamp);
        time.textContent = formatRelative(chat.timestamp);
    }
    meta.append(time, createElement('span', '', plural('messageCount', chat.messages)));

    open.append(title, preview, meta);

    const tools = createElement('span', 'acg-chat__tools');
    const rename = createButton('rename-chat', 'acg-icon-button acg-icon-button--small', text('renameChat'));
    rename.dataset.chat = chat.id;
    rename.append(createIcon('fa-solid fa-pen'));
    const remove = createButton('delete-chat', 'acg-icon-button acg-icon-button--small acg-icon-button--danger', text('deleteChat'));
    remove.dataset.chat = chat.id;
    remove.append(createIcon('fa-solid fa-trash-can'));
    tools.append(rename, remove);

    row.append(open, tools);
    return row;
}

async function deleteChat(record, chatId, button) {
    const lifecycle = state.lifecycle;
    const index = findCurrentCharacter(record.avatarKey);
    if (index < 0) return showNotice('missing');

    setPanelBusy(true);
    setButtonBusy(button, true);
    try {
        const confirmed = await Popup.show.confirm(
            text('deleteChatTitle'),
            escapeHtml(text('deleteChatText', { name: chatId })),
        );
        if (!confirmed || !state.ready || state.lifecycle !== lifecycle) return;
        await deleteCharacterChatByName(String(index), chatId);
        state.chatCache.delete(record.avatarKey);
        invalidateRecords();
    } catch (error) {
        showError('chatDeleteError', error);
    } finally {
        setPanelBusy(false);
        if (state.ready && state.lifecycle === lifecycle && state.panel.record?.avatarKey === record.avatarKey) {
            await loadChats(record);
        }
    }
}

async function renameChat(record, chatId, button) {
    const lifecycle = state.lifecycle;
    const index = findCurrentCharacter(record.avatarKey);
    if (index < 0) return showNotice('missing');

    setPanelBusy(true);
    setButtonBusy(button, true);
    try {
        const value = await Popup.show.input(text('renameChat'), escapeHtml(text('renamePrompt')), chatId);
        const newName = typeof value === 'string' ? value.trim() : '';
        if (!newName || newName === chatId || !state.ready || state.lifecycle !== lifecycle) return;

        const wasCurrent = getCurrentChatName(record) === chatId;
        const before = new Set((state.panel.chats ?? []).map((chat) => chat.id));
        await renameGroupOrCharacterChat({
            characterId: String(index),
            oldFileName: chatId,
            newFileName: newName,
            loader: true,
        });

        // SillyTavern only repoints the selected character's active chat, so
        // keep this character's "current chat" in step when it was renamed here.
        const after = await getPastCharacterChats(index);
        const ids = (Array.isArray(after) ? after : []).map(normalizeChat).filter(Boolean).map((chat) => chat.id);
        if (wasCurrent && !ids.includes(chatId) && getCurrentChatName(record) === chatId) {
            const renamed = ids.includes(newName) ? newName : ids.find((id) => !before.has(id));
            if (renamed) await updateRemoteChatName(String(index), renamed);
        }
    } catch (error) {
        showError('chatRenameError', error);
    } finally {
        setPanelBusy(false);
        if (state.ready && state.lifecycle === lifecycle && state.panel.record?.avatarKey === record.avatarKey) {
            await loadChats(record);
        }
    }
}

function handlePanelKeydown(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closePanel();
        return;
    }
    if (event.key !== 'Tab') return;

    const panel = event.currentTarget;
    const focusable = [...panel.querySelectorAll('button:not(:disabled), input:not([hidden])')]
        .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function handleSheetDragStart(event) {
    if (!isSheetLayout() || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    const panel = state.panel.layer?.querySelector('.acg-panel');
    if (!(panel instanceof HTMLElement)) return;

    state.panel.drag = { startY: event.clientY, startTime: event.timeStamp, offset: 0 };
    panel.style.transition = 'none';
    const header = event.currentTarget;
    header.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => {
        if (!state.panel.drag) return;
        const offset = Math.max(0, moveEvent.clientY - state.panel.drag.startY);
        state.panel.drag.offset = offset;
        panel.style.transform = `translateY(${offset}px)`;
    };
    const end = (endEvent) => {
        header.removeEventListener('pointermove', move);
        header.removeEventListener('pointerup', end);
        header.removeEventListener('pointercancel', end);
        const drag = state.panel.drag;
        state.panel.drag = null;
        panel.style.removeProperty('transition');
        if (!drag) return;
        const velocity = drag.offset / Math.max(1, endEvent.timeStamp - drag.startTime);
        if (drag.offset > Math.min(140, panel.offsetHeight * 0.3) || (drag.offset > 30 && velocity > 0.6)) {
            closePanel();
        } else {
            panel.style.removeProperty('transform');
        }
    };
    header.addEventListener('pointermove', move);
    header.addEventListener('pointerup', end);
    header.addEventListener('pointercancel', end);
}

function handlePanelAction(button) {
    const record = state.panel.record;
    const action = button.dataset.action;
    if (action === 'close-panel') return closePanel();
    if (!record || state.panel.busy) return;
    if (action === 'continue') return void enterCharacter(record, button);
    if (action === 'new-chat') return void enterCharacter(record, button, { newChat: true });
    if (action === 'retry-chats') {
        state.panel.status = 'loading';
        renderPanel();
        return void loadChats(record);
    }
    if (action === 'delete-character') {
        return void confirmDelete(record, button).then((deleted) => {
            if (deleted) closePanel({ restoreFocus: false });
        });
    }
    const chatId = button.dataset.chat;
    if (!chatId) return;
    if (action === 'open-chat') return void enterCharacter(record, button, { chatId });
    if (action === 'rename-chat') return void renameChat(record, chatId, button);
    if (action === 'delete-chat') return void deleteChat(record, chatId, button);
}

/* ---------- Pointer and click handling ---------- */

function clearPressTimer() {
    window.clearTimeout(state.pressTimer);
    state.pressTimer = 0;
}

function showTouchHintOnce() {
    if (state.settings.touchHintShown || !window.matchMedia('(hover: none)').matches) return;
    state.settings.touchHintShown = true;
    state.context.saveSettingsDebounced();
    globalThis.toastr?.info?.(text('touchHint'), text('title'), { timeOut: 6000 });
}

function handlePointerDown(event) {
    if (event.pointerType === 'mouse' || event.button !== 0) return;
    const open = event.target instanceof Element ? event.target.closest('.acg-card__open') : null;
    if (!(open instanceof HTMLButtonElement)) return;

    clearPressTimer();
    state.pressActive = true;
    state.pressRevealed = false;
    open.setPointerCapture?.(event.pointerId);
    state.pressStartX = event.clientX;
    state.pressStartY = event.clientY;
    state.pressTimer = window.setTimeout(() => {
        state.pressTimer = 0;
        state.pressRevealed = true;
        const record = state.recordByAvatar.get(open.dataset.avatar || '');
        if (!record) return;
        navigator.vibrate?.(8);
        openPanel(record, open);
    }, LONG_PRESS_MS);
}

function handlePointerMove(event) {
    if (!state.pressTimer) return;
    if (Math.abs(event.clientX - state.pressStartX) > 10
        || Math.abs(event.clientY - state.pressStartY) > 10) {
        clearPressTimer();
    }
}

function handlePointerEnd() {
    clearPressTimer();
    state.pressActive = false;
    if (!state.pressRevealed) return;
    state.pressRevealed = false;
    // The click that follows a long-press would otherwise open the chat or
    // land on the freshly opened panel's backdrop and close it again.
    state.suppressClickUntil = performance.now() + 600;
}

function handleClickCapture(event) {
    if (!state.suppressClickUntil) return;
    const suppress = performance.now() < state.suppressClickUntil;
    state.suppressClickUntil = 0;
    if (!suppress) return;
    event.preventDefault();
    event.stopPropagation();
}

function handleCardContextMenu(event) {
    const open = event.target instanceof Element ? event.target.closest('.acg-card__open') : null;
    if (!(open instanceof HTMLButtonElement)) return;
    event.preventDefault();
    const record = state.recordByAvatar.get(open.dataset.avatar || '');
    if (!record) return;
    if (state.pressActive) {
        // A touch long-press can raise contextmenu before our timer fires.
        clearPressTimer();
        state.pressRevealed = true;
    }
    openPanel(record, open);
}

function handleRootClick(event) {
    const button = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (!(button instanceof HTMLElement) || (button instanceof HTMLButtonElement && button.disabled)) return;

    if (button.closest('.acg-panel-layer')) return handlePanelAction(button);
    if (button.dataset.action === 'previous') return changePage(-1);
    if (button.dataset.action === 'next') return changePage(1);
    if (button.dataset.action === 'clear-search') {
        setCharacterQuery('');
        state.root?.querySelector('[data-role="character-search"]')?.focus();
        return;
    }

    const avatar = button.dataset.avatar || '';
    const record = state.recordByAvatar.get(avatar);
    if (!record) return;
    if (button.dataset.action === 'open') void enterCharacter(record, button);
    if (button.dataset.action === 'history') openPanel(record, button);
    if (button.dataset.action === 'delete') void confirmDelete(record, button);
}

function handleDocumentKeydown(event) {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!state.root || state.root.hidden || state.panel.record || !state.settings.showToolbar) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, dialog'))) return;
    const input = state.root.querySelector('[data-role="character-search"]');
    if (!(input instanceof HTMLInputElement)) return;
    event.preventDefault();
    input.focus();
    input.select();
}

/* ---------- Settings ---------- */

function syncSettingsControls() {
    if (!state.settingsRoot || !state.settings) return;
    const query = (selector) => state.settingsRoot.querySelector(selector);
    const pageSize = query('#cg_page_size');
    const columns = query('#cg_grid_columns');
    const cardTheme = query('#cg_card_theme');
    const customGradient = query('#cg_custom_gradient');
    const customText = query('#cg_custom_text');
    const customColors = query('#cg_custom_colors');
    const showToolbar = query('#cg_show_toolbar');
    const showLastChat = query('#cg_show_last_chat');
    if (pageSize instanceof HTMLSelectElement) pageSize.value = String(state.settings.pageSize);
    if (columns instanceof HTMLSelectElement) columns.value = state.settings.gridColumns;
    if (cardTheme instanceof HTMLSelectElement) cardTheme.value = state.settings.cardTheme;
    if (customGradient instanceof HTMLInputElement) customGradient.value = state.settings.customGradient;
    if (customText instanceof HTMLInputElement) customText.value = state.settings.customText;
    if (customColors instanceof HTMLElement) customColors.hidden = state.settings.cardTheme !== 'custom';
    if (showToolbar instanceof HTMLInputElement) showToolbar.checked = state.settings.showToolbar;
    if (showLastChat instanceof HTMLInputElement) showLastChat.checked = state.settings.showLastChat;
}

function handleSettingsChange(event) {
    const control = event.target;
    if (!(control instanceof HTMLSelectElement || control instanceof HTMLInputElement)) return;
    if (event.type === 'input' && control.type !== 'color') return;

    let changed = false;
    if (control.id === 'cg_page_size' && PAGE_SIZE_VALUES.has(Number(control.value))) {
        state.settings.pageSize = Number(control.value);
        state.page = 1;
        changed = true;
        if (isLibraryVisible()) renderGallery();
    }
    if (control.id === 'cg_grid_columns' && GRID_COLUMN_VALUES.has(control.value)) {
        state.settings.gridColumns = control.value;
        changed = true;
        applyDisplayPreferences();
    }
    if (control.id === 'cg_card_theme' && CARD_THEME_VALUES.has(control.value)) {
        state.settings.cardTheme = control.value;
        changed = true;
        applyDisplayPreferences();
        syncSettingsControls();
    }
    if (control.id === 'cg_show_toolbar') {
        state.settings.showToolbar = control.checked;
        if (!control.checked) state.query = '';
        changed = true;
        if (isLibraryVisible()) renderGallery();
        else applyDisplayPreferences();
    }
    if (control.id === 'cg_show_last_chat') {
        state.settings.showLastChat = control.checked;
        changed = true;
        if (isLibraryVisible()) renderGallery();
    }
    const colorSetting = {
        cg_custom_gradient: 'customGradient',
        cg_custom_text: 'customText',
    }[control.id];
    const colorValue = control.value.toLowerCase();
    if (colorSetting
        && HEX_COLOR_PATTERN.test(colorValue)
        && state.settings[colorSetting] !== colorValue) {
        state.settings[colorSetting] = colorValue;
        changed = true;
        applyDisplayPreferences();
    }
    if (changed) saveSettings();
}

async function mountSettings(lifecycle) {
    const host = document.getElementById('extensions_settings')
        || document.getElementById('extensions_settings2');
    if (!host) return;

    const existing = document.querySelector(`.${SETTINGS_CLASS}`);
    if (existing instanceof HTMLElement) {
        const anchor = host.querySelector(SETTINGS_ANCHOR);
        if (anchor instanceof HTMLElement) anchor.before(existing);
        else if (existing.parentElement !== host) host.append(existing);
        state.settingsRoot = existing;
        syncSettingsControls();
        return;
    }

    const html = await state.context.renderExtensionTemplateAsync(EXTENSION_NAME, 'settings');
    if (!state.ready || state.lifecycle !== lifecycle) return;
    if (typeof html !== 'string') throw new Error('Settings template is unavailable.');
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const settingsRoot = template.content.querySelector(`.${SETTINGS_CLASS}`);
    if (!(settingsRoot instanceof HTMLElement)) return;

    settingsRoot.addEventListener('change', handleSettingsChange);
    settingsRoot.addEventListener('input', handleSettingsChange);
    const anchor = host.querySelector(SETTINGS_ANCHOR);
    if (anchor instanceof HTMLElement) anchor.before(settingsRoot);
    else host.append(settingsRoot);
    state.settingsRoot = settingsRoot;
    syncSettingsControls();
}

/* ---------- Lifecycle ---------- */

function isLibraryVisible() {
    return state.context?.getCurrentChatId?.() === undefined;
}

function scheduleGalleryRender() {
    if (state.renderFrame || !state.ready || !isLibraryVisible()) return;
    state.renderFrame = window.requestAnimationFrame(() => {
        state.renderFrame = 0;
        if (isLibraryVisible()) renderGallery();
    });
}

function invalidateRecords({ resetPage = false } = {}) {
    state.records = null;
    state.recordByAvatar.clear();
    if (resetPage) state.page = 1;
    scheduleGalleryRender();
}

function updateVisibility() {
    refreshContext();
    const library = isLibraryVisible();
    const visible = library || state.holdOpen;
    const root = ensureRoot();
    root.hidden = !visible;
    document.body.classList.toggle(BODY_CLASS, visible);
    if (!visible) closePanel({ immediate: true, restoreFocus: false });
    if (library) {
        scheduleGalleryRender();
        showTouchHintOnce();
    }
    return library;
}

function handleChatChanged() {
    if (updateVisibility()) invalidateRecords({ resetPage: true });
}

function handleChatsChanged() {
    state.chatCache.clear();
    if (isLibraryVisible()) invalidateRecords();
}

function handleSettingsUpdated() {
    const previousKey = state.settingsKey;
    loadSettings();
    const nextKey = getSettingsKey();
    const language = getLanguage();
    const settingsChanged = previousKey !== nextKey;
    const languageChanged = state.uiLanguage !== language;
    state.settingsKey = nextKey;
    syncSettingsControls();
    if (settingsChanged) applyDisplayPreferences();
    if (settingsChanged || languageChanged) scheduleGalleryRender();
}

function listen(eventName, handler, first = false) {
    if (!eventName) return;
    const source = state.context.eventSource;
    if (first) source.makeFirst(eventName, handler);
    else source.on(eventName, handler);
    state.listeners.push([source, eventName, handler]);
}

function listenDom(target, eventName, handler) {
    target.addEventListener(eventName, handler);
    state.domListeners.push([target, eventName, handler]);
}

function registerEvents() {
    const events = state.context.eventTypes;
    listen(events.CHAT_CHANGED, handleChatChanged, true);
    listen(events.SETTINGS_UPDATED, handleSettingsUpdated);

    for (const eventName of [
        events.CHARACTER_EDITED,
        events.CHARACTER_DELETED,
        events.CHARACTER_DUPLICATED,
        events.CHARACTER_RENAMED,
        events.CHARACTER_PAGE_LOADED,
    ]) {
        listen(eventName, () => invalidateRecords());
    }
    for (const eventName of [events.CHAT_DELETED, events.CHAT_CREATED, events.CHAT_RENAMED]) {
        listen(eventName, handleChatsChanged);
    }
    listenDom(document, 'keydown', handleDocumentKeydown);
}

async function start() {
    if (state.ready) return;
    state.ready = true;
    const lifecycle = ++state.lifecycle;
    refreshContext();
    loadSettings();
    state.settingsKey = getSettingsKey();
    state.uiLanguage = getLanguage();
    ensureRoot();
    registerEvents();
    updateVisibility();

    try {
        await mountSettings(lifecycle);
    } catch (error) {
        warn('settings', error);
    }
}

function init() {
    refreshContext();
    listen(state.context.eventTypes.APP_READY, () => {
        void start().catch((error) => warn('start', error));
    });
}

export function cleanup() {
    state.lifecycle += 1;
    for (const [source, eventName, handler] of state.listeners) {
        source.removeListener?.(eventName, handler);
    }
    for (const [target, eventName, handler] of state.domListeners) {
        target.removeEventListener(eventName, handler);
    }
    state.listeners = [];
    state.domListeners = [];
    window.cancelAnimationFrame(state.renderFrame);
    window.clearTimeout(state.pressTimer);
    window.clearTimeout(state.panel.closeTimer);
    state.root?.remove();
    state.settingsRoot?.remove();
    document.body.classList.remove(BODY_CLASS);
    state.context = null;
    state.settings = null;
    state.root = null;
    state.settingsRoot = null;
    state.records = null;
    state.recordByAvatar.clear();
    state.chatCache.clear();
    state.busyAvatars.clear();
    state.query = '';
    state.page = 1;
    state.renderFrame = 0;
    state.pressTimer = 0;
    state.pressActive = false;
    state.pressRevealed = false;
    state.suppressClickUntil = 0;
    state.holdOpen = false;
    state.settingsKey = '';
    state.uiLanguage = '';
    state.panel = {
        layer: null,
        record: null,
        chats: null,
        status: 'idle',
        filter: '',
        requestId: 0,
        closeTimer: 0,
        busy: false,
        returnFocus: null,
        drag: null,
    };
    state.ready = false;
}

try {
    init();
} catch (error) {
    warn('init', error);
}
