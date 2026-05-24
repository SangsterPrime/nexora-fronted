import '../../styles/particles/DataParticles.css'

const particles = [
  ['green', 12, 18, 3, 18, 0],
  ['cyan', 18, 62, 2, 22, 1.8],
  ['magenta', 24, 34, 4, 26, 0.7],
  ['green', 30, 76, 2, 20, 2.4],
  ['cyan', 38, 22, 5, 28, 1.2],
  ['green', 44, 52, 3, 24, 3.2],
  ['magenta', 52, 14, 2, 30, 1.6],
  ['cyan', 58, 84, 4, 23, 0.4],
  ['green', 64, 38, 2, 27, 2.8],
  ['cyan', 70, 66, 3, 21, 1.1],
  ['magenta', 76, 28, 5, 32, 3.5],
  ['green', 82, 74, 3, 25, 0.9],
  ['cyan', 88, 46, 2, 29, 2.1],
  ['green', 8, 82, 4, 31, 3.8],
  ['magenta', 16, 42, 2, 27, 4.4],
  ['cyan', 27, 88, 3, 20, 2.7],
  ['green', 35, 8, 2, 34, 1.5],
  ['cyan', 48, 72, 5, 26, 4.1],
  ['magenta', 56, 58, 3, 30, 2.2],
  ['green', 68, 12, 4, 24, 0.2],
  ['cyan', 74, 92, 2, 33, 3.1],
  ['green', 86, 18, 3, 28, 4.6],
  ['magenta', 92, 58, 2, 22, 1.4],
  ['cyan', 96, 78, 4, 35, 2.6],
  ['green', 6, 28, 2, 26, 5.2],
  ['cyan', 42, 92, 3, 31, 4.9],
  ['magenta', 62, 6, 2, 29, 3.9],
  ['green', 78, 52, 6, 36, 5.6],
]

function DataParticles() {
  return (
    <div className="data-particles" aria-hidden="true">
      {particles.map(([tone, x, y, size, duration, delay], index) => (
        <span
          className={`data-particles__dot data-particles__dot--${tone}`}
          key={`${tone}-${x}-${y}-${index}`}
          style={{
            '--particle-x': `${x}%`,
            '--particle-y': `${y}%`,
            '--particle-size': `${size}px`,
            '--particle-duration': `${duration}s`,
            '--particle-delay': `${delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default DataParticles
