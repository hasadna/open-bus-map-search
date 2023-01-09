const PLACEHOLDER = 'XXX'

export const TEXTS = {
  timeline_page_title: 'לוח זמנים היסטורי',
  gaps_page_title: 'פערי נסיעות מתוכננות',
  choose_datetime: 'תאריך ושעה',
  choose_operator: 'חברה מפעילה',
  operator_placeholder: 'לדוגמא: דן',
  choose_line: 'מספר קו',
  line_placeholder: 'לדוגמא: 17א',
  choose_route: `בחירת מסלול נסיעה (XXX אפשרויות)`,
  choose_stop: `בחירת תחנה (XXX אפשרויות)`,
  direction_arrow: '⟵',
  time_format: 'HH:mm:ss',
  datetime_format: 'HH:mm:ss · YYYY-MM-DD',
  loading_routes: 'מסלולי נסיעה בטעינה',
  loading_stops: 'תחנות עצירה בטעינה',
  timestamp_target: 'זמן החיפוש ⌚',
  timestamp_gtfs: 'זמן עצירה מתוכנן 🕛',
  timestamp_siri: 'זמן עצירה בפועל 🚌',
  loading_hits: 'זמני נסיעה בטעינה',
  line_not_found: 'הקו לא נמצא',
  hits_not_found: 'לא נמצאו נסיעות מתוכננות או בפועל',
}

export const formatted = (text: string, value: string) => text.replace(PLACEHOLDER, value)
