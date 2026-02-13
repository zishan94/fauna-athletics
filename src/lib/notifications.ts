import { toast } from 'sonner'

/* ── Welcome / Goodbye ── */

export function notifyWelcome(name: string) {
  toast.success(`Willkommen zurück, ${name}!`, {
    description: 'Schön, dass du wieder da bist.',
    duration: 4000,
  })
}

export function notifyWelcomeNew(name: string) {
  toast.success(`Willkommen bei Fauna Athletics, ${name}!`, {
    description: 'Dein Konto wurde erfolgreich erstellt.',
    duration: 5000,
  })
}

export function notifyGoodbye(name: string) {
  toast('Bis bald, ' + name + '!', {
    description: 'Du wurdest erfolgreich abgemeldet.',
    duration: 3500,
  })
}

/* ── Cart ── */

export function notifyCartAdd(productName: string) {
  toast.success('In den Warenkorb gelegt', {
    description: productName,
    duration: 3000,
  })
}

export function notifyCartRemove(productName: string) {
  toast('Artikel entfernt', {
    description: productName,
    duration: 3000,
  })
}

export function notifyCartUpdate() {
  toast.success('Warenkorb aktualisiert', {
    duration: 2000,
  })
}

/* ── Wishlist ── */

export function notifyWishlistAdd(productName?: string) {
  toast.success('Zur Wunschliste hinzugefügt', {
    description: productName || undefined,
    duration: 2500,
  })
}

export function notifyWishlistRemove(productName?: string) {
  toast('Von Wunschliste entfernt', {
    description: productName || undefined,
    duration: 2500,
  })
}

/* ── Newsletter ── */

export function notifyNewsletter() {
  toast.success('Willkommen im Rudel!', {
    description: 'Du erhältst in Kürze eine Bestätigung per E-Mail.',
    duration: 5000,
  })
}

/* ── Generic ── */

export function notifySuccess(message: string, description?: string) {
  toast.success(message, { description, duration: 3500 })
}

export function notifyError(message: string, description?: string) {
  toast.error(message, { description, duration: 5000 })
}

export function notifyInfo(message: string, description?: string) {
  toast(message, { description, duration: 3500 })
}

/* ── Profile ── */

export function notifyProfileSaved() {
  toast.success('Profil gespeichert', {
    description: 'Deine Änderungen wurden übernommen.',
    duration: 3000,
  })
}

export function notifyAddressSaved() {
  toast.success('Adresse gespeichert', {
    duration: 3000,
  })
}

export function notifyAddressDeleted() {
  toast('Adresse gelöscht', {
    duration: 3000,
  })
}

/* ── Contact ── */

export function notifyContactSent() {
  toast.success('Nachricht gesendet!', {
    description: 'Wir melden uns so schnell wie möglich bei dir.',
    duration: 5000,
  })
}

/* ── Order ── */

export function notifyOrderPlaced() {
  toast.success('Bestellung aufgegeben!', {
    description: 'Vielen Dank für deinen Einkauf.',
    duration: 5000,
  })
}
