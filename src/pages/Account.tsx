import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Package, LogOut, Mail, Lock, Eye, EyeOff, ChevronRight,
  MapPin, Edit3, Trash2, Plus, Save, Loader2, Check, X,
  Shield, AlertCircle, UserPlus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRegion } from '../context/RegionContext'
import { sdk } from '../lib/sdk'
import { notifyWelcome, notifyWelcomeNew, notifyProfileSaved, notifyAddressSaved, notifyAddressDeleted } from '../lib/notifications'

type DashTab = 'orders' | 'profile' | 'addresses'

/* ── Login Form ── */
function LoginForm() {
  const { login, customer, isAuthenticated } = useAuth()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const welcomeFired = useRef(false)

  // Auto-focus email field
  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 200)
  }, [])

  // Show welcome toast when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && customer?.first_name && !welcomeFired.current) {
      welcomeFired.current = true
      notifyWelcome(customer.first_name)
    }
  }, [isAuthenticated, customer])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordValid = password.length >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)

    if (!emailValid) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }

    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (!result.success) setError(result.error || 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.')
    setLoading(false)
  }

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"
  const inputErrorClass = "w-full bg-f-gray/50 border border-red-500/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-red-500/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-f-muted/50" />
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onBlur={() => setEmailTouched(true)}
              placeholder="deine@email.ch"
              className={`${emailTouched && email && !emailValid ? inputErrorClass : inputClass} pl-11`}
              required
              autoComplete="email"
            />
            {emailTouched && email && !emailValid && (
              <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" />
            )}
          </div>
          {emailTouched && email && !emailValid && (
            <p className="text-red-400 text-[11px] mt-1.5">Bitte gib eine gültige E-Mail-Adresse ein.</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted">Passwort</label>
            <button type="button" className="text-[11px] text-f-green-light hover:text-f-sage transition-colors" onClick={() => {}}>
              Passwort vergessen?
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-f-muted/50" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onBlur={() => setPasswordTouched(true)}
              placeholder="••••••••"
              className={`${passwordTouched && password && !passwordValid ? inputErrorClass : inputClass} pl-11 pr-11`}
              required
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-f-muted/50 hover:text-f-muted">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 bg-red-900/20 border border-red-500/30 p-3.5 rounded-sm">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-[13px]">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Anmelden...
              </>
            ) : (
              'Anmelden'
            )}
          </span>
          <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-f-muted/50 text-[11px]">
            <Shield size={12} />
            <span>SSL-verschlüsselt</span>
          </div>
          <div className="flex items-center gap-1.5 text-f-muted/50 text-[11px]">
            <Lock size={12} />
            <span>Sichere Anmeldung</span>
          </div>
        </div>
      </form>
    </>
  )
}

/* ── Register Form ── */
function RegisterForm() {
  const { register } = useAuth()
  const firstNameRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwTouched, setPwTouched] = useState(false)

  // Auto-focus first name
  useEffect(() => {
    setTimeout(() => firstNameRef.current?.focus(), 200)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwTouched(true)
    if (form.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    setLoading(true)
    setError('')
    const result = await register(form)
    if (result.success) {
      notifyWelcomeNew(form.first_name)
    } else {
      setError(result.error || 'Registrierung fehlgeschlagen')
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : form.password.length < 12 ? 3 : 4
  const pwStrengthLabel = ['', 'Schwach', 'Mittel', 'Stark', 'Sehr stark']
  const pwStrengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-f-green-light', 'bg-f-sage']

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Vorname</label>
          <input ref={firstNameRef} name="first_name" value={form.first_name} onChange={handleChange} placeholder="Max" className={inputClass} required autoComplete="given-name" />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Nachname</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Muster" className={inputClass} required autoComplete="family-name" />
        </div>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-f-muted/50" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="deine@email.ch" className={`${inputClass} pl-11`} required autoComplete="email" />
        </div>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Passwort</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-f-muted/50" />
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            onBlur={() => setPwTouched(true)}
            placeholder="Min. 8 Zeichen"
            className={`${inputClass} pl-11 pr-11`}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-f-muted/50 hover:text-f-muted">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Password strength indicator */}
        {form.password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map(level => (
                <div key={level} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  pwStrength >= level ? pwStrengthColor[pwStrength] : 'bg-f-border/30'
                }`} />
              ))}
            </div>
            <p className={`text-[10px] ${pwStrength <= 1 ? 'text-red-400' : pwStrength === 2 ? 'text-yellow-400' : 'text-f-green-light'}`}>
              {pwStrengthLabel[pwStrength]}
            </p>
          </div>
        )}
        {pwTouched && form.password.length > 0 && form.password.length < 8 && (
          <p className="text-red-400 text-[11px] mt-1">Mind. 8 Zeichen erforderlich.</p>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2.5 bg-red-900/20 border border-red-500/30 p-3.5 rounded-sm">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-[13px]">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Registrieren...
            </>
          ) : (
            <>
              <UserPlus size={14} />
              Konto erstellen
            </>
          )}
        </span>
        <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      </button>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-f-muted/50 text-[11px]">
          <Shield size={12} />
          <span>Daten geschützt</span>
        </div>
        <div className="flex items-center gap-1.5 text-f-muted/50 text-[11px]">
          <Lock size={12} />
          <span>Verschlüsselt</span>
        </div>
      </div>
    </form>
  )
}

/* ── Orders Tab ── */
function OrdersTab() {
  const { formatPrice } = useRegion()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    sdk.store.order.list()
      .then((res: any) => setOrders(res.orders || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [])

  if (ordersLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-f-gray/30 p-6 space-y-3">
            <div className="h-4 bg-f-gray w-1/3" />
            <div className="h-3 bg-f-gray w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-f-gray/30 border border-f-border/20 p-10 text-center">
        <Package size={32} className="text-f-muted/30 mx-auto mb-4" />
        <p className="text-f-muted text-[15px] mb-2">Noch keine Bestellungen</p>
        <p className="text-f-muted/60 text-[13px] mb-6">Entdecke unsere Kollektion und tätige deine erste Bestellung.</p>
        <Link to="/shop" className="text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline">
          Zum Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="flex items-center justify-between bg-f-gray/30 border border-f-border/20 p-6 hover:border-f-green/20 hover:bg-f-gray/50 transition-all duration-300 group"
        >
          <div>
            <p className="text-[14px] font-medium">Bestellung #{order.display_id || order.id.slice(-8)}</p>
            <p className="text-f-muted text-[12px] mt-1">
              {new Date(order.created_at).toLocaleDateString('de-CH')} &middot; {order.items?.length || 0} Artikel
            </p>
            <span className={`inline-block mt-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] rounded-sm ${
              order.status === 'canceled' ? 'bg-red-900/30 text-red-400' :
              order.status === 'completed' ? 'bg-f-green/15 text-f-green-light' :
              'bg-f-gray text-f-muted'
            }`}>
              {order.status === 'canceled' ? 'Storniert' :
               order.status === 'completed' ? 'Abgeschlossen' : 'Offen'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-semibold">{formatPrice(order.total || 0)}</span>
            <ChevronRight size={16} className="text-f-muted group-hover:text-f-green-light transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ── Profile Tab ── */
function ProfileTab() {
  const { customer, refreshCustomer } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone: customer?.phone || '',
  })

  useEffect(() => {
    setForm({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
    })
  }, [customer])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await sdk.store.customer.update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      } as any)
      await refreshCustomer()
      setEditing(false)
      setSuccess(true)
      notifyProfileSaved()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || 'Profil konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted font-medium">Persönliche Daten</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-f-green-light text-[12px] uppercase tracking-[0.15em] hover:underline">
            <Edit3 size={13} /> Bearbeiten
          </button>
        )}
      </div>

      {success && (
        <div className="bg-f-green/10 border border-f-green/30 p-4 mb-6 rounded-sm flex items-center gap-3">
          <Check size={16} className="text-f-green-light" />
          <p className="text-f-green-light text-[14px]">Profil erfolgreich gespeichert.</p>
        </div>
      )}

      <div className="bg-f-gray/30 border border-f-border/20 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Vorname</label>
            {editing ? (
              <input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} />
            ) : (
              <p className="text-[14px] py-3.5">{customer?.first_name || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Nachname</label>
            {editing ? (
              <input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} />
            ) : (
              <p className="text-[14px] py-3.5">{customer?.last_name || '—'}</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail</label>
          <p className="text-[14px] py-3.5 text-f-muted">{customer?.email} <span className="text-[11px] text-f-muted/50">(nicht änderbar)</span></p>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Telefon</label>
          {editing ? (
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+41 79 123 45 67" className={inputClass} />
          ) : (
            <p className="text-[14px] py-3.5">{customer?.phone || '—'}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setEditing(false); setError('') }}
            className="px-6 py-3.5 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.15em] transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-3.5 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Save size={14} /> {saving ? 'Speichern...' : 'Speichern'}
            </span>
            <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-[13px] mt-4">{error}</p>}
    </div>
  )
}

/* ── Addresses Tab ── */
function AddressesTab() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', address_1: '', address_2: '',
    city: '', postal_code: '', country_code: 'ch', phone: '',
  })

  const fetchAddresses = () => {
    setLoading(true)
    sdk.store.customer.listAddress()
      .then((res: any) => setAddresses(res.addresses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAddresses() }, [])

  const handleAdd = async () => {
    setSaving(true)
    setError('')
    try {
      await sdk.store.customer.createAddress(form as any)
      setShowForm(false)
      setForm({ first_name: '', last_name: '', address_1: '', address_2: '', city: '', postal_code: '', country_code: 'ch', phone: '' })
      fetchAddresses()
      notifyAddressSaved()
    } catch (err: any) {
      setError(err?.message || 'Adresse konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sdk.store.customer.deleteAddress(id)
      fetchAddresses()
      notifyAddressDeleted()
    } catch {}
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-f-gray/30 p-6 space-y-3">
            <div className="h-4 bg-f-gray w-1/2" />
            <div className="h-3 bg-f-gray w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {addresses.length === 0 && !showForm && (
        <div className="bg-f-gray/30 border border-f-border/20 p-10 text-center mb-6">
          <MapPin size={32} className="text-f-muted/30 mx-auto mb-4" />
          <p className="text-f-muted text-[15px] mb-2">Keine gespeicherten Adressen</p>
          <p className="text-f-muted/60 text-[13px]">Füge eine Adresse hinzu für schnelleres Bestellen.</p>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-4 mb-6">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="bg-f-gray/30 border border-f-border/20 p-6 flex justify-between items-start">
              <div>
                <p className="text-[14px] font-medium">{addr.first_name} {addr.last_name}</p>
                <p className="text-f-muted text-[13px] mt-1">{addr.address_1}</p>
                {addr.address_2 && <p className="text-f-muted text-[13px]">{addr.address_2}</p>}
                <p className="text-f-muted text-[13px]">{addr.postal_code} {addr.city}</p>
                <p className="text-f-muted text-[13px]">{addr.country_code?.toUpperCase()}</p>
                {addr.phone && <p className="text-f-muted text-[12px] mt-1">{addr.phone}</p>}
                {addr.is_default_shipping && (
                  <span className="inline-block mt-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] bg-f-green/15 text-f-green-light rounded-sm">
                    Standard
                  </span>
                )}
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-f-muted hover:text-red-400 transition-colors p-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-f-gray/30 border border-f-border/20 p-6">
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-5 font-medium">Neue Adresse</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Vorname *</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Nachname *</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Strasse *</label>
              <input name="address_1" value={form.address_1} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Adresszusatz</label>
              <input name="address_2" value={form.address_2} onChange={handleChange} className={inputClass} />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">PLZ *</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Ort *</label>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Land</label>
              <select name="country_code" value={form.country_code} onChange={handleChange} className={inputClass}>
                <option value="ch">Schweiz</option>
                <option value="de">Deutschland</option>
                <option value="at">Österreich</option>
                <option value="li">Liechtenstein</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Telefon</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+41 79 123 45 67" className={inputClass} />
            </div>
          </div>
          {error && <p className="text-red-400 text-[13px] mt-4">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setShowForm(false); setError('') }} className="px-6 py-3.5 border border-f-border text-f-muted hover:text-f-text text-[12px] uppercase tracking-[0.15em] transition-all">
              Abbrechen
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !form.first_name || !form.last_name || !form.address_1 || !form.postal_code || !form.city}
              className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-3.5 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Save size={14} /> {saving ? 'Speichern...' : 'Adresse speichern'}
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline"
        >
          <Plus size={14} /> Neue Adresse hinzufügen
        </button>
      )}
    </div>
  )
}

/* ── Dashboard ── */
function Dashboard() {
  const { customer, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<DashTab>('orders')

  const TABS: { key: DashTab; label: string; icon: any }[] = [
    { key: 'orders', label: 'Bestellungen', icon: Package },
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'addresses', label: 'Adressen', icon: MapPin },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl tracking-[0.02em]">
            HALLO, {customer?.first_name?.toUpperCase() || 'ATHLET'}
          </h1>
          <p className="text-f-muted text-[15px] mt-2">{customer?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-f-muted hover:text-red-400 text-[12px] uppercase tracking-[0.15em] transition-colors"
        >
          <LogOut size={16} /> Abmelden
        </button>
      </div>

      <div className="accent-line mb-8" />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-f-green/10 border border-f-green/40 text-f-green-light'
                  : 'text-f-muted hover:text-f-text border border-transparent hover:border-f-border/30'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'addresses' && <AddressesTab />}
    </div>
  )
}

/* ── Account Page ── */
export default function Account() {
  const { isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  if (loading) {
    return (
      <div className="py-28 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-f-green/30 border-t-f-green rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto">
          <Dashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-f-green/10 border border-f-green/25 flex items-center justify-center mx-auto mb-5">
              <User size={24} className="text-f-green-light" />
            </div>
            <h1 className="font-heading text-4xl tracking-[0.02em]">MEIN KONTO</h1>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border border-f-border/30">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                tab === 'login' ? 'bg-f-green/10 text-f-green-light border-b-2 border-f-green' : 'text-f-muted hover:text-f-text'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                tab === 'register' ? 'bg-f-green/10 text-f-green-light border-b-2 border-f-green' : 'text-f-muted hover:text-f-text'
              }`}
            >
              Registrieren
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </div>
    </div>
  )
}
