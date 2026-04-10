/**
 * Icon name resolver — maps AI-generated icon names to local SVG paths.
 *
 * AI outputs various icon naming conventions (Lucide, Material Symbols, Feather).
 * This maps them all to heroicons SVGs in `/icons/outline/`.
 */

// ─── Lucide → heroicons mapping ──────────────────────────────────────────

const LUCIDE_MAP: Record<string, string> = {
  // Common AI outputs → heroicons
  BrainCircuit: 'cpu',
  Brain: 'light-bulb',
  Zap: 'bolt',
  Lightning: 'bolt',
  Shield: 'shield-check',
  ShieldCheck: 'shield-check',
  Lock: 'lock-closed',
  LockClosed: 'lock-closed',
  LockOpen: 'lock-open',
  Globe: 'globe',
  GlobeAlt: 'globe',
  CpuChip: 'cpu',
  Cpu: 'cpu',
  Rocket: 'paper-airplane',
  Star: 'star',
  Heart: 'heart',
  Eye: 'eye',
  Users: 'users',
  User: 'user',
  Chart: 'chart-bar',
  ChartBar: 'chart-bar',
  BarChart: 'chart-bar',
  Graph: 'chart-bar-square',
  TrendingUp: 'arrow-up',
  ArrowUp: 'arrow-up',
  ArrowDown: 'arrow-down',
  Clock: 'clock',
  Calendar: 'calendar-days',
  Mail: 'envelope',
  Email: 'envelope',
  Phone: 'phone',
  MapPin: 'map-pin',
  Home: 'home',
  Search: 'magnifying-glass',
  Settings: 'cog-6-tooth',
  Gear: 'cog-6-tooth',
  Bell: 'bell',
  Camera: 'video-camera',
  Video: 'video-camera',
  Play: 'play',
  Pause: 'pause',
  Check: 'check',
  CheckCircle: 'check-circle',
  XCircle: 'x-circle',
  AlertTriangle: 'exclamation-triangle',
  AlertCircle: 'exclamation-circle',
  Info: 'information-circle',
  Share: 'share',
  Link: 'link',
  Cloud: 'cloud',
  Server: 'server',
  Database: 'circle-stack',
  Code: 'code-bracket',
  Terminal: 'command-line',
  FileText: 'document-text',
  Folder: 'folder-open',
  Download: 'arrow-down',
  Upload: 'arrow-up',
  Trash: 'trash',
  Edit: 'pencil',
  Pencil: 'pencil',
  ShoppingBag: 'shopping-bag',
  ShoppingCart: 'shopping-cart',
  CreditCard: 'credit-card',
  DollarSign: 'currency-dollar',
  Fire: 'fire',
  Sparkles: 'sparkles',
  Gift: 'gift',
  Trophy: 'trophy',
  Megaphone: 'megaphone',
  Tag: 'tag',
  Ticket: 'ticket',
  Lightbulb: 'light-bulb',
  Sun: 'sun',
  Moon: 'moon',
  Palette: 'swatch',
  Music: 'musical-note',
  Presentation: 'presentation-chart-line',
  Briefcase: 'briefcase',
  Building: 'building-office',
  UsersGroup: 'user-group',
  Security: 'shield-check',
  Speed: 'bolt',
  Automation: 'arrow-path',
  Integration: 'link',
  Analytics: 'chart-bar',
  AI: 'sparkles',
  MachineLearning: 'cpu',
  Workflow: 'arrow-path',
  Pipeline: 'arrow-path',
  Data: 'chart-bar-square',
  Report: 'document-text',
  Dashboard: 'chart-bar',
  Notification: 'bell',
  Collaboration: 'users',
  Team: 'user-group',
  Chat: 'chat-bubble-left-right',
  Support: 'chat-bubble-left-ellipsis',
  Help: 'question-mark-circle',
  LockSecurity: 'lock-closed',
  Compliance: 'shield-check',
  Scalability: 'arrow-up',
  Performance: 'bolt',
  Reliability: 'check-circle',
  Innovation: 'light-bulb',
  Quality: 'star',
};

// ─── Material Symbols → heroicons mapping ────────────────────────────────

const MATERIAL_MAP: Record<string, string> = {
  // Common Material Symbols that AI might output
  speed: 'bolt',
  shield: 'shield-check',
  security: 'shield-check',
  bolt: 'bolt',
  zap: 'bolt',
  brain: 'light-bulb',
  psychology: 'light-bulb',
  smart_toy: 'cpu',
  auto_awesome: 'sparkles',
  rocket_launch: 'paper-airplane',
  trending_up: 'arrow-up',
  analytics: 'chart-bar',
  monitor_heart: 'chart-bar-square',
  hub: 'globe',
  language: 'globe',
  groups: 'user-group',
  diversity_3: 'user-group',
  workspace_premium: 'trophy',
  verified: 'check-circle',
  lock: 'lock-closed',
  cloud: 'cloud',
  settings: 'cog-6-tooth',
  notifications: 'bell',
  search: 'magnifying-glass',
  home: 'home',
  star: 'star',
  favorite: 'heart',
  mail: 'envelope',
  phone: 'phone',
  calendar_month: 'calendar-days',
  schedule: 'clock',
};

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Resolve an icon name from any naming convention to a local SVG path.
 * Returns null if no matching icon is found.
 */
export function resolveIconPath(iconName: string): string | null {
  if (!iconName) return null;

  const name = iconName.trim();

  // 1. Try Lucide mapping
  const lucide = LUCIDE_MAP[name] ?? LUCIDE_MAP[name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')];
  if (lucide) return `/icons/outline/${lucide}.svg`;

  // 2. Try Material Symbols mapping
  const material = MATERIAL_MAP[name] ?? MATERIAL_MAP[name.toLowerCase()];
  if (material) return `/icons/outline/${material}.svg`;

  // 3. No match — return null so caller can use Material Symbols fallback
  return null;
}
