import { MaterialIcons } from '@expo/vector-icons';

export const ICONS = {
  // Iconos de navegación
  home: 'home',
  matches: 'sports',
  players: 'people',
  tournaments: 'emoji-events',
  settings: 'settings',

  // Iconos de acciones
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  cancel: 'cancel',
  back: 'arrow-back',
  forward: 'arrow-forward',
  refresh: 'refresh',
  search: 'search',
  filter: 'filter-list',
  sort: 'sort',
  share: 'share',
  favorite: 'favorite',
  favoriteBorder: 'favorite-border',
  star: 'star',
  starBorder: 'star-border',

  // Iconos de estado
  check: 'check',
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'check-circle',
  loading: 'hourglass-empty',

  // Iconos de jugadores
  player: 'person',
  playerAdd: 'person-add',
  playerRemove: 'person-remove',
  playerEdit: 'edit',

  // Iconos de partidas
  match: 'sports',
  matchAdd: 'add-circle',
  matchEdit: 'edit',
  matchDelete: 'delete',
  matchComplete: 'check-circle',
  matchPending: 'hourglass-empty',

  // Iconos de torneos
  tournament: 'emoji-events',
  tournamentAdd: 'add-circle',
  tournamentEdit: 'edit',
  tournamentDelete: 'delete',
  tournamentComplete: 'check-circle',
  tournamentPending: 'hourglass-empty',
} as const;

export type IconName = keyof typeof ICONS;

export const getIcon = (name: IconName): keyof typeof MaterialIcons.glyphMap => {
  return ICONS[name] as keyof typeof MaterialIcons.glyphMap;
}; 