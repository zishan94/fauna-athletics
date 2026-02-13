import { defineWidgetConfig } from "@medusajs/admin-sdk"
import "../style.css"

/**
 * Fauna Athletics Admin Branding
 * 
 * Dieses Widget rendert ein gebrandetes Header-Element
 * auf der Medusa Admin Login-Seite und injiziert das
 * benutzerdefinierte CSS für das Fauna Athletics Branding.
 */
const BrandingWidget = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 24px 16px',
      marginBottom: '8px',
    }}>
      {/* Brand name */}
      <h1 style={{
        fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
        fontSize: '32px',
        letterSpacing: '0.08em',
        color: '#f0f0f0',
        margin: 0,
        lineHeight: 1.1,
      }}>
        FAUNA ATHLETICS
      </h1>
      {/* Accent line */}
      <div style={{
        width: '48px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #2d6a4f, transparent)',
        margin: '12px 0',
      }} />
      {/* Subtitle */}
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '12px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: '#8a8a8a',
        margin: 0,
      }}>
        Admin-Dashboard
      </p>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default BrandingWidget
