import { useState, useCallback, useRef } from 'react'

// Vite eager-imports every mp3 in src/imports/ and gives us their hashed URLs
const soundFiles = import.meta.glob('./imports/*.mp3', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

function audioUrl(filename: string): string {
  return soundFiles[`./imports/${filename}`] ?? ''
}

type Sound = {
  id: string
  symbol: string
  word: string
  file: string
}

type Category = {
  label: string
  sounds: Sound[]
}

const categories: Category[] = [
  {
    label: 'Vowels',
    sounds: [
      { id: 'ae',       symbol: 'æ',   word: 'cat',    file: 'sound_æ.mp3'       },
      { id: 'long-a',   symbol: 'ɑː',  word: 'father', file: 'sound_long_ɑ.mp3'  },
      { id: 'open-o',   symbol: 'ɒ',   word: 'lot',    file: 'sound_ɒ.mp3'       },
      { id: 'long-o',   symbol: 'ɔː',  word: 'thought',file: 'sound_long_ɔ.mp3'  },
      { id: 'wedge',    symbol: 'ʌ',   word: 'cup',    file: 'sound_ʌ.mp3'       },
      { id: 'schwa',    symbol: 'ə',   word: 'about',  file: 'sound_ə.mp3'       },
      { id: 'long-schwa',symbol:'ɜː',  word: 'bird',   file: 'sound_long_ə.mp3'  },
      { id: 'short-i',  symbol: 'ɪ',   word: 'bit',    file: 'sound_short_i.mp3' },
      { id: 'happy-i',  symbol: 'i',   word: 'happy',  file: 'sound_i.mp3'       },
      { id: 'long-e',   symbol: 'iː',  word: 'see',    file: 'sound_long_e.mp3'  },
      { id: 'short-u',  symbol: 'ʊ',   word: 'book',   file: 'sound_u.mp3'       },
      { id: 'long-u',   symbol: 'uː',  word: 'food',   file: 'sound_long_u.mp3'  },
      { id: 'e',        symbol: 'e',   word: 'bed',    file: 'sound_e.mp3'       },
    ],
  },
  {
    label: 'Diphthongs',
    sounds: [
      { id: 'ei',  symbol: 'eɪ', word: 'face',   file: 'sound_eɪ.mp3' },
      { id: 'ai',  symbol: 'aɪ', word: 'price',  file: 'sound_aɪ.mp3' },
      { id: 'oi',  symbol: 'ɔɪ', word: 'choice', file: 'sound_ɔɪ.mp3' },
      { id: 'au',  symbol: 'aʊ', word: 'mouth',  file: 'sound_aʊ.mp3' },
      { id: 'ou',  symbol: 'əʊ', word: 'goat',   file: 'sound_əʊ.mp3' },
      { id: 'ia',  symbol: 'ɪə', word: 'near',   file: 'sound_ɪə.mp3' },
      { id: 'ua',  symbol: 'ʊə', word: 'cure',   file: 'sound_ʊə.mp3' },
    ],
  },
  {
    label: 'Consonants',
    sounds: [
      { id: 'p',   symbol: 'p',  word: 'pet',    file: 'sound_p.mp3'  },
      { id: 'b',   symbol: 'b',  word: 'bet',    file: 'sound_b.mp3'  },
      { id: 't',   symbol: 't',  word: 'ten',    file: 'sound_t.mp3'  },
      { id: 'd',   symbol: 'd',  word: 'den',    file: 'sound_d.mp3'  },
      { id: 'k',   symbol: 'k',  word: 'cat',    file: 'sound_k.mp3'  },
      { id: 'g',   symbol: 'g',  word: 'get',    file: 'sound_g.mp3'  },
      { id: 'f',   symbol: 'f',  word: 'fat',    file: 'sound_f.mp3'  },
      { id: 'v',   symbol: 'v',  word: 'vat',    file: 'sound_v.mp3'  },
      { id: 'theta',symbol:'θ',  word: 'think',  file: 'sound_θ.mp3'  },
      { id: 'eth', symbol: 'ð',  word: 'this',   file: 'sound_ð.mp3'  },
      { id: 's',   symbol: 's',  word: 'sat',    file: 'sound_S.mp3'  },
      { id: 'z',   symbol: 'z',  word: 'zoo',    file: 'sound_Z.mp3'  },
      { id: 'sh',  symbol: 'ʃ',  word: 'she',    file: 'sound_ʃ.mp3'  },
      { id: 'zh',  symbol: 'ʒ',  word: 'vision', file: 'sound_ʒ.mp3'  },
      { id: 'h',   symbol: 'h',  word: 'hat',    file: 'sound_h.mp3'  },
      { id: 'ch',  symbol: 'tʃ', word: 'chair',  file: 'sound_ʧ.mp3'  },
      { id: 'dj',  symbol: 'dʒ', word: 'judge',  file: 'sound_ʤ.mp3'  },
      { id: 'm',   symbol: 'm',  word: 'mat',    file: 'sound_m.mp3'  },
      { id: 'n',   symbol: 'n',  word: 'net',    file: 'sound_n.mp3'  },
      { id: 'eng', symbol: 'ŋ',  word: 'sing',   file: 'sound_ŋ.mp3'  },
      { id: 'l',   symbol: 'l',  word: 'let',    file: 'sound_l.mp3'  },
      { id: 'r',   symbol: 'r',  word: 'red',    file: 'sound_r.mp3'  },
      { id: 'w',   symbol: 'w',  word: 'wet',    file: 'sound_w.mp3'  },
      { id: 'j',   symbol: 'j',  word: 'yes',    file: 'sound_j.mp3'  },
    ],
  },
]

const totalSounds = categories.reduce((acc, cat) => acc + cat.sounds.length, 0)

// ── Wave animation shown while a tile is playing ──────────────────────────────

function WaveIcon({ playing }: { playing: boolean }) {
  if (!playing) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.28 }}>
        <path d="M7 1.5C7 1.5 9.5 3.5 9.5 7C9.5 10.5 7 12.5 7 12.5"
          stroke="#6B6460" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 3.5C4 3.5 5.5 4.8 5.5 7C5.5 9.2 4 10.5 4 10.5"
          stroke="#6B6460" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="2.5" cy="7" r="1" fill="#6B6460" />
      </svg>
    )
  }
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 14 }}>
      <div className="wave-bar" />
      <div className="wave-bar" />
      <div className="wave-bar" />
      <div className="wave-bar" />
      <div className="wave-bar" />
    </div>
  )
}

// ── Individual sound tile ─────────────────────────────────────────────────────

function SoundTile({
  sound,
  isPlaying,
  onPlay,
}: {
  sound: Sound
  isPlaying: boolean
  onPlay: (sound: Sound) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onPlay(sound)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={isPlaying ? 'tile-playing' : ''}
      title={`/${sound.symbol}/ · "${sound.word}"`}
      style={{
        width: 84,
        height: 84,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 24,
        border: isPlaying
          ? '1.5px solid rgba(139,175,138,0.55)'
          : '1.5px solid rgba(0,0,0,0.055)',
        backgroundColor: isPlaying ? 'rgba(245,252,245,0.95)' : '#FFFFFF',
        boxShadow: hovered && !isPlaying
          ? '0 8px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
          : isPlaying
          ? undefined
          : '0 2px 10px rgba(0,0,0,0.065), 0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background-color 0.15s ease',
        cursor: 'pointer',
        outline: 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 26,
          lineHeight: 1,
          color: isPlaying ? '#4A7A4A' : '#2C2825',
          fontWeight: 400,
          transition: 'color 0.2s ease',
          letterSpacing: '-0.01em',
          userSelect: 'none',
        }}
      >
        {sound.symbol}
      </span>
      <WaveIcon playing={isPlaying} />
    </button>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = useCallback((sound: Sound) => {
    // Stop whatever is playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const url = audioUrl(sound.file)
    if (!url) {
      // File not yet uploaded — silently skip
      return
    }

    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingId(sound.id)

    audio.play().catch(() => setPlayingId(null))
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F3EE',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 32,
        paddingBottom: 56,
      }}
    >
      <div style={{ width: 420, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{ padding: '0 28px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LeafIcon />
            </div>
          </div>
          <h1
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 400,
              color: '#2C2825',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            little sounds
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 12.5,
              fontWeight: 300,
              color: '#A89E97',
              marginTop: 4,
              letterSpacing: '0.04em',
            }}
          >
            tiny sounds to explore
          </p>
        </div>

        {/* ── Categories ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {categories.map((cat) => (
            <section key={cat.label} style={{ padding: '0 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#8B7F78',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    backgroundColor: 'rgba(0,0,0,0.045)',
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}
                >
                  {cat.label}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 84px)',
                  gap: 10,
                }}
              >
                {cat.sounds.map((sound) => (
                  <SoundTile
                    key={sound.id}
                    sound={sound}
                    isPlaying={playingId === sound.id}
                    onPlay={handlePlay}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 36,
            textAlign: 'center',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 11.5,
            fontWeight: 300,
            color: '#BEB4AD',
            letterSpacing: '0.03em',
          }}
        >
          {totalSounds} sounds &middot; tap to listen
        </div>
      </div>
    </div>
  )
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 14C9 14 4.5 11.5 4.5 8C4.5 5.5 6.5 3.5 9 3.5C11.5 3.5 13.5 5.5 13.5 8C13.5 11.5 9 14 9 14Z"
        stroke="#8BAF8A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path d="M9 14V8" stroke="#8BAF8A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 8C9 8 7 6.5 7 5" stroke="#8BAF8A" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
