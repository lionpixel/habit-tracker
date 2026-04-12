import { ImageResponse } from 'next/og'

export const runtime      = 'edge'
export const alt          = 'HabitDB — Sistema Científico de Hábitos'
export const size         = { width: 1200, height: 630 }
export const contentType  = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #080b14 0%, #0d1120 60%, #080b14 100%)',
          width:       '100%',
          height:      '100%',
          display:     'flex',
          flexDirection: 'column',
          alignItems:   'center',
          justifyContent: 'center',
          fontFamily:   'system-ui, sans-serif',
          position:     'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position:     'absolute',
            top:          '50%',
            left:         '50%',
            transform:    'translate(-50%, -50%)',
            width:        700,
            height:       700,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
            display:      'flex',
          }}
        />
        <div
          style={{
            position:     'absolute',
            top:          '30%',
            right:        '10%',
            width:        300,
            height:       300,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)',
            display:      'flex',
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            width:        96,
            height:       96,
            borderRadius: 24,
            background:   'linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            marginBottom: 28,
            boxShadow:    '0 0 60px rgba(124,58,237,0.5)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <path
              d="M5 24 L9 10 L13 18 L17 8 L21 14 L27 24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize:     72,
            fontWeight:   800,
            color:        'white',
            letterSpacing: '-2px',
            marginBottom: 16,
            display:      'flex',
          }}
        >
          HabitDB
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize:   26,
            color:      '#94a3b8',
            marginBottom: 48,
            display:    'flex',
          }}
        >
          Sistema Científico de Hábitos
        </div>

        {/* Feature tags */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['Hábitos', 'Sono', 'Foco', 'Finanças', 'Metas', 'Planner'].map((tag) => (
            <div
              key={tag}
              style={{
                padding:      '10px 20px',
                background:   'rgba(124,58,237,0.12)',
                border:       '1px solid rgba(124,58,237,0.25)',
                borderRadius: 24,
                color:        '#a78bfa',
                fontSize:     16,
                fontWeight:   600,
                display:      'flex',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            position:     'absolute',
            bottom:       40,
            right:        48,
            fontSize:     14,
            color:        '#475569',
            display:      'flex',
          }}
        >
          habitdb.vercel.app
        </div>
      </div>
    ),
    { ...size },
  )
}
